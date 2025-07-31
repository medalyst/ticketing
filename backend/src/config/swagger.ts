import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Medalyst Ticketing API',
      version: '1.0.0',
      description: 'A ticketing system API with user authentication and CRUD operations for tickets',
    },
    servers: [
      {
        url: 'http://localhost:5050/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
          },
        },
        Ticket: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Ticket ID',
            },
            title: {
              type: 'string',
              description: 'Ticket title',
            },
            description: {
              type: 'string',
              description: 'Ticket description',
            },
            status: {
              type: 'string',
              enum: ['OPEN', 'IN_PROGRESS', 'CLOSED'],
              description: 'Ticket status',
            },
            createdBy: {
              type: 'string',
              description: 'ID of user who created the ticket',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        CreateTicket: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Ticket title',
            },
            description: {
              type: 'string',
              description: 'Ticket description',
            },
            status: {
              type: 'string',
              enum: ['OPEN', 'IN_PROGRESS', 'CLOSED'],
              default: 'OPEN',
              description: 'Ticket status',
            },
          },
        },
        UpdateTicket: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Ticket title',
            },
            description: {
              type: 'string',
              description: 'Ticket description',
            },
            status: {
              type: 'string',
              enum: ['OPEN', 'IN_PROGRESS', 'CLOSED'],
              description: 'Ticket status',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Username',
            },
            password: {
              type: 'string',
              description: 'Password',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              description: 'Username',
            },
            password: {
              type: 'string',
              description: 'Password',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

export default specs;
