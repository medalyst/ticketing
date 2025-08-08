import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../../middleware/auth';

interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

describe('Authentication Middleware - Unit Tests', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      sendStatus: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();

    // Set JWT secret for testing
    process.env.JWT_SECRET = 'test-secret-key';
  });

  describe('Valid Authentication', () => {
    it('should authenticate with valid token', () => {
      const payload = { userId: 'user123', username: 'testuser' };
      const token = jwt.sign(payload, process.env.JWT_SECRET!);
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockRequest.userId).toBe(payload.userId);
      expect(mockRequest.username).toBe(payload.username);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.sendStatus).not.toHaveBeenCalled();
    });

    it('should handle token with additional claims', () => {
      const payload = { 
        userId: 'user123', 
        username: 'testuser',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET!);
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockRequest.userId).toBe(payload.userId);
      expect(mockRequest.username).toBe(payload.username);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('Invalid Authentication', () => {
    it('should return 401 when no authorization header', () => {
      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockRequest.userId).toBeUndefined();
    });

    it('should return 401 when authorization header is empty', () => {
      mockRequest.headers = {
        authorization: ''
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token'
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockRequest.userId).toBeUndefined();
    });

    it('should return 403 when token has wrong signature', () => {
      const payload = { userId: 'user123', username: 'testuser' };
      const token = jwt.sign(payload, 'wrong-secret');
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 when token is expired', () => {
      const payload = { 
        userId: 'user123', 
        username: 'testuser',
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET!);
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle malformed authorization header', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle authorization header without Bearer prefix', () => {
      const payload = { userId: 'user123', username: 'testuser' };
      const token = jwt.sign(payload, process.env.JWT_SECRET!);
      
      mockRequest.headers = {
        authorization: token // Missing "Bearer " prefix
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Token Parsing', () => {
    it('should extract token correctly from Bearer format', () => {
      const payload = { userId: 'user123', username: 'testuser' };
      const token = jwt.sign(payload, process.env.JWT_SECRET!);
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.userId).toBe('user123');
    });

    it('should handle extra whitespace in authorization header', () => {
      const payload = { userId: 'user123', username: 'testuser' };
      const token = jwt.sign(payload, process.env.JWT_SECRET!);
      
      mockRequest.headers = {
        authorization: `  Bearer   ${token}  `
      };

      // This would fail with current implementation, but it's good to test edge cases
      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
    });
  });

  describe('JWT Secret Handling', () => {
    it('should handle missing JWT_SECRET environment variable gracefully', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      const payload = { userId: 'user123', username: 'testuser' };
      const token = jwt.sign(payload, 'some-secret');
      
      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      // The middleware should handle this gracefully by sending 403
      authenticate(mockRequest as AuthRequest, mockResponse as Response, nextFunction);
      
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
      
      // Restore the original secret
      process.env.JWT_SECRET = originalSecret;
    });
  });
});