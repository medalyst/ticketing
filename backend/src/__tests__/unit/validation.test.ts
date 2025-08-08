import { Request, Response } from 'express';
import {
  validateUsername,
  validatePassword,
  validateTicketTitle,
  validateTicketDescription,
  validateComment,
  validateTicketStatus,
  validateAuthRequest,
  validateTicketRequest,
  validateCommentRequest
} from '../../middleware/validation';

describe('Validation Functions - Unit Tests', () => {
  describe('validateUsername', () => {
    it('should validate correct username', () => {
      const result = validateUsername('testuser');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should validate username with numbers and underscores', () => {
      const result = validateUsername('user_123');
      expect(result.isValid).toBe(true);
    });

    it('should validate username with hyphens', () => {
      const result = validateUsername('user-name');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty username', () => {
      const result = validateUsername('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('should reject undefined username', () => {
      const result = validateUsername(undefined as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('should reject non-string username', () => {
      const result = validateUsername(123 as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username is required');
    });

    it('should reject username too short', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must be at least 3 characters long');
    });

    it('should reject username too long', () => {
      const result = validateUsername('a'.repeat(21));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username must be less than 20 characters');
    });

    it('should reject username with invalid characters', () => {
      const result = validateUsername('user@name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Username can only contain letters, numbers, underscores, and hyphens');
    });

    it('should trim whitespace and validate', () => {
      const result = validateUsername('  testuser  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is required');
    });

    it('should reject undefined password', () => {
      const result = validatePassword(undefined as any);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password is required');
    });

    it('should reject password too short', () => {
      const result = validatePassword('abc12');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be at least 6 characters long');
    });

    it('should reject password too long', () => {
      const result = validatePassword('a'.repeat(101));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must be less than 100 characters');
    });

    it('should reject password without letters', () => {
      const result = validatePassword('123456');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must contain at least one letter and one number');
    });

    it('should reject password without numbers', () => {
      const result = validatePassword('abcdef');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Password must contain at least one letter and one number');
    });
  });

  describe('validateTicketTitle', () => {
    it('should validate correct title', () => {
      const result = validateTicketTitle('Test Ticket Title');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty title', () => {
      const result = validateTicketTitle('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    it('should reject title too short', () => {
      const result = validateTicketTitle('ab');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title must be at least 3 characters long');
    });

    it('should reject title too long', () => {
      const result = validateTicketTitle('a'.repeat(101));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title must be less than 100 characters');
    });

    it('should trim whitespace and validate', () => {
      const result = validateTicketTitle('  Test Title  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateTicketDescription', () => {
    it('should validate correct description', () => {
      const result = validateTicketDescription('This is a test description');
      expect(result.isValid).toBe(true);
    });

    it('should allow empty description', () => {
      const result = validateTicketDescription('');
      expect(result.isValid).toBe(true);
    });

    it('should allow undefined description', () => {
      const result = validateTicketDescription(undefined as any);
      expect(result.isValid).toBe(true);
    });

    it('should reject description too long', () => {
      const result = validateTicketDescription('a'.repeat(1001));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Description must be less than 1000 characters');
    });
  });

  describe('validateComment', () => {
    it('should validate correct comment', () => {
      const result = validateComment('This is a test comment');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty comment', () => {
      const result = validateComment('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Comment content is required');
    });

    it('should reject comment with only whitespace', () => {
      const result = validateComment('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Comment cannot be empty');
    });

    it('should reject comment too long', () => {
      const result = validateComment('a'.repeat(501));
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Comment must be less than 500 characters');
    });
  });

  describe('validateTicketStatus', () => {
    it('should validate correct statuses', () => {
      const statuses = ['OPEN', 'IN_PROGRESS', 'CLOSED'];
      statuses.forEach(status => {
        const result = validateTicketStatus(status);
        expect(result.isValid).toBe(true);
      });
    });

    it('should allow empty status', () => {
      const result = validateTicketStatus('');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = validateTicketStatus('INVALID_STATUS');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Status must be OPEN, IN_PROGRESS, or CLOSED');
    });
  });
});

describe('Validation Middleware - Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  describe('validateAuthRequest', () => {
    it('should pass with valid auth data', () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'password123'
      };

      validateAuthRequest(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject invalid username', () => {
      mockRequest.body = {
        username: 'ab',
        password: 'password123'
      };

      validateAuthRequest(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Username must be at least 3 characters long'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject invalid password', () => {
      mockRequest.body = {
        username: 'testuser',
        password: 'abc'
      };

      validateAuthRequest(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Password must be at least 6 characters long'
      });
    });
  });

  describe('validateTicketRequest', () => {
    it('should pass with valid ticket data', () => {
      mockRequest.body = {
        title: 'Test Ticket',
        description: 'Test Description',
        status: 'OPEN'
      };

      validateTicketRequest(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject invalid title', () => {
      mockRequest.body = {
        title: 'ab',
        description: 'Test Description'
      };

      validateTicketRequest(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Title must be at least 3 characters long'
      });
    });

    it('should reject invalid status', () => {
      mockRequest.body = {
        title: 'Test Ticket',
        status: 'INVALID'
      };

      validateTicketRequest(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Status must be OPEN, IN_PROGRESS, or CLOSED'
      });
    });
  });

  describe('validateCommentRequest', () => {
    it('should pass with valid comment data', () => {
      mockRequest.body = {
        content: 'This is a test comment'
      };

      validateCommentRequest(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject empty comment', () => {
      mockRequest.body = {
        content: ''
      };

      validateCommentRequest(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Comment content is required'
      });
    });
  });
});