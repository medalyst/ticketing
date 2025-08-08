import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock the models
jest.mock('../../models/User');
jest.mock('../../models/Ticket');
jest.mock('../../models/Comment');

import { User } from '../../models/User';
import { Ticket } from '../../models/Ticket';
import { Comment } from '../../models/Comment';
import authRoutes from '../../routes/auth';
import ticketRoutes from '../../routes/tickets';
import commentRoutes from '../../routes/comments';

const MockedUser = User as jest.Mocked<typeof User>;
const MockedTicket = Ticket as jest.Mocked<typeof Ticket>;
const MockedComment = Comment as jest.Mocked<typeof Comment>;

describe('API Routes - Integration Tests', () => {
  let app: express.Application;
  let authToken: string;
  const testUser = {
    _id: 'user123',
    username: 'testuser',
    password: 'hashedpassword'
  };

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret-key';
    
    // Create test app
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/tickets', ticketRoutes);
    app.use('/api/comments', commentRoutes);

    // Generate auth token for authenticated routes
    authToken = jwt.sign(
      { userId: testUser._id, username: testUser.username },
      process.env.JWT_SECRET!
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication Routes', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const userData = {
          username: 'newuser',
          password: 'password123'
        };

        MockedUser.findOne.mockResolvedValue(null);
        MockedUser.create.mockResolvedValue({
          _id: 'newuser123',
          username: userData.username,
          password: 'hashedpassword'
        } as any);

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.username).toBe(userData.username);
        expect(response.body).not.toHaveProperty('password');
        expect(MockedUser.findOne).toHaveBeenCalledWith({ username: userData.username });
        expect(MockedUser.create).toHaveBeenCalled();
      });

      it('should reject duplicate username', async () => {
        const userData = {
          username: 'existinguser',
          password: 'password123'
        };

        MockedUser.findOne.mockResolvedValue({ username: userData.username } as any);

        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Username already exists');
      });

      it('should validate input data', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ username: 'ab', password: 'password123' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Username must be at least 3 characters long');
      });
    });

    describe('POST /api/auth/login', () => {
      it('should login with valid credentials', async () => {
        const loginData = {
          username: 'testuser',
          password: 'password123'
        };

        const hashedPassword = await bcrypt.hash(loginData.password, 12);
        MockedUser.findOne.mockResolvedValue({
          _id: testUser._id,
          username: testUser.username,
          password: hashedPassword
        } as any);

        const response = await request(app)
          .post('/api/auth/login')
          .send(loginData);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.username).toBe(loginData.username);
      });

      it('should reject invalid credentials', async () => {
        MockedUser.findOne.mockResolvedValue(null);

        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: 'nonexistent', password: 'password123' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Invalid username or password');
      });
    });
  });

  describe('Ticket Routes', () => {
    describe('GET /api/tickets', () => {
      it('should get tickets for authenticated user', async () => {
        const mockTickets = [
          {
            _id: 'ticket1',
            title: 'Test Ticket 1',
            description: 'Description 1',
            status: 'OPEN',
            createdBy: testUser._id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            _id: 'ticket2',
            title: 'Test Ticket 2',
            status: 'IN_PROGRESS',
            createdBy: testUser._id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];

        MockedTicket.find.mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockTickets)
        } as any);

        const response = await request(app)
          .get('/api/tickets')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].title).toBe('Test Ticket 1');
      });

      it('should handle search parameters', async () => {
        MockedTicket.find.mockReturnValue({
          sort: jest.fn().mockResolvedValue([])
        } as any);

        const response = await request(app)
          .get('/api/tickets?search=test&status=OPEN&sortBy=title&sortOrder=asc')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(MockedTicket.find).toHaveBeenCalledWith({
          status: 'OPEN',
          $or: [{ title: { $regex: 'test', $options: 'i' } }]
        });
      });

      it('should require authentication', async () => {
        const response = await request(app).get('/api/tickets');
        expect(response.status).toBe(401);
      });
    });

    describe('POST /api/tickets', () => {
      it('should create a new ticket', async () => {
        const ticketData = {
          title: 'New Ticket',
          description: 'New Description',
          status: 'OPEN'
        };

        const mockCreatedTicket = {
          _id: 'newticket123',
          ...ticketData,
          createdBy: testUser._id,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        MockedTicket.create.mockResolvedValue(mockCreatedTicket as any);

        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${authToken}`)
          .send(ticketData);

        expect(response.status).toBe(201);
        expect(response.body.title).toBe(ticketData.title);
        expect(MockedTicket.create).toHaveBeenCalledWith({
          title: ticketData.title.trim(),
          description: ticketData.description.trim(),
          status: ticketData.status,
          createdBy: testUser._id
        });
      });

      it('should validate ticket data', async () => {
        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'ab' }); // Too short

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Title must be at least 3 characters long');
      });
    });

    describe('GET /api/tickets/:id', () => {
      it('should get a specific ticket', async () => {
        const mockTicket = {
          _id: 'ticket123',
          title: 'Test Ticket',
          description: 'Test Description',
          status: 'OPEN',
          createdBy: testUser._id
        };

        MockedTicket.findOne.mockResolvedValue(mockTicket as any);

        const response = await request(app)
          .get('/api/tickets/ticket123')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe(mockTicket.title);
        expect(MockedTicket.findOne).toHaveBeenCalledWith({
          _id: 'ticket123'
        });
      });

      it('should return 404 for non-existent ticket', async () => {
        MockedTicket.findOne.mockResolvedValue(null);

        const response = await request(app)
          .get('/api/tickets/nonexistent')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Ticket not found');
      });
    });

    describe('PUT /api/tickets/:id', () => {
      it('should update a ticket', async () => {
        const updateData = {
          title: 'Updated Title',
          description: 'Updated Description',
          status: 'IN_PROGRESS'
        };

        const mockUpdatedTicket = {
          _id: 'ticket123',
          ...updateData,
        };

        MockedTicket.findOneAndUpdate.mockResolvedValue(mockUpdatedTicket as any);

        const response = await request(app)
          .put('/api/tickets/ticket123')
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe(updateData.title);
      });
    });

    describe('DELETE /api/tickets/:id', () => {
      it('should delete a ticket', async () => {
        const mockTicket = { _id: 'ticket123', title: 'Test Ticket' };
        MockedTicket.findOneAndDelete.mockResolvedValue(mockTicket as any);

        const response = await request(app)
          .delete('/api/tickets/ticket123')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Ticket deleted');
        expect(MockedTicket.findOneAndDelete).toHaveBeenCalledWith({
          _id: 'ticket123',
          createdBy: testUser._id
        });
      });
    });
  });

  describe('Comment Routes', () => {
    describe('GET /api/comments/ticket/:ticketId', () => {
      it('should get comments for a ticket', async () => {
        const mockComments = [
          {
            _id: 'comment1',
            content: 'First comment',
            ticketId: 'ticket123',
            userId: testUser._id,
            username: testUser.username,
            createdAt: new Date()
          },
          {
            _id: 'comment2',
            content: 'Second comment',
            ticketId: 'ticket123',
            userId: testUser._id,
            username: testUser.username,
            createdAt: new Date()
          }
        ];

        MockedTicket.findOne.mockResolvedValue({ _id: 'ticket123', createdBy: testUser._id } as any);
        MockedComment.find.mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockComments)
        } as any);

        const response = await request(app)
          .get('/api/comments/ticket/ticket123')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].content).toBe('First comment');
      });

      it('should return 404 for non-existent ticket', async () => {
        MockedTicket.findOne.mockResolvedValue(null);

        const response = await request(app)
          .get('/api/comments/ticket/nonexistent')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Ticket not found');
      });
    });

    describe('POST /api/comments', () => {
      it('should create a new comment', async () => {
        const commentData = {
          content: 'New comment content',
          ticketId: 'ticket123'
        };

        const mockCreatedComment = {
          _id: 'newcomment123',
          content: commentData.content,
          ticketId: commentData.ticketId,
          userId: testUser._id,
          username: testUser.username,
          createdAt: new Date()
        };

        MockedTicket.findOne.mockResolvedValue({ _id: 'ticket123', createdBy: testUser._id } as any);
        MockedComment.create.mockResolvedValue(mockCreatedComment as any);

        const response = await request(app)
          .post('/api/comments')
          .set('Authorization', `Bearer ${authToken}`)
          .send(commentData);

        expect(response.status).toBe(201);
        expect(response.body.content).toBe(commentData.content);
        expect(MockedComment.create).toHaveBeenCalledWith({
          content: commentData.content.trim(),
          ticketId: commentData.ticketId,
          userId: testUser._id,
          username: testUser.username
        });
      });

      it('should validate comment data', async () => {
        const response = await request(app)
          .post('/api/comments')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content: '', ticketId: 'ticket123' });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Comment content is required');
      });
    });

    describe('DELETE /api/comments/:id', () => {
      it('should delete own comment', async () => {
        const mockComment = {
          _id: 'comment123',
          userId: testUser._id,
          content: 'Test comment'
        };

        MockedComment.findOne.mockResolvedValue(mockComment as any);
        MockedComment.findByIdAndDelete.mockResolvedValue(mockComment as any);

        const response = await request(app)
          .delete('/api/comments/comment123')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Comment deleted');
        expect(MockedComment.findOne).toHaveBeenCalledWith({
          _id: 'comment123',
          userId: testUser._id
        });
      });

      it('should not delete other users comments', async () => {
        MockedComment.findOne.mockResolvedValue(null);

        const response = await request(app)
          .delete('/api/comments/comment123')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Comment not found or unauthorized');
      });
    });
  });
});