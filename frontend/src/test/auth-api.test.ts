import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { login, register } from '../api/auth'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should make POST request to login endpoint with credentials', async () => {
      const mockResponse = {
        data: {
          token: 'test-token',
          user: {
            _id: '123',
            username: 'testuser'
          }
        }
      }

      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const result = await login('testuser', 'password123')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5050/api/auth/login',
        { username: 'testuser', password: 'password123' }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle login failure', async () => {
      const errorResponse = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      }

      mockedAxios.post.mockRejectedValueOnce(errorResponse)

      await expect(login('wronguser', 'wrongpass')).rejects.toEqual(errorResponse)
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      mockedAxios.post.mockRejectedValueOnce(networkError)

      await expect(login('testuser', 'password123')).rejects.toThrow('Network Error')
    })

    it('should handle empty credentials', async () => {
      const mockResponse = { data: { token: 'test', user: { _id: '1', username: '' } } }
      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const result = await login('', '')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5050/api/auth/login',
        { username: '', password: '' }
      )
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('register', () => {
    it('should make POST request to register endpoint with credentials', async () => {
      const mockResponse = {
        data: {
          message: 'User created successfully',
          user: {
            _id: '456',
            username: 'newuser'
          }
        }
      }

      mockedAxios.post.mockResolvedValueOnce(mockResponse)

      const result = await register('newuser', 'password123')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5050/api/auth/register',
        { username: 'newuser', password: 'password123' }
      )
      expect(result).toEqual(mockResponse.data)
    })

    it('should handle registration failure - user already exists', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { message: 'Username already exists' }
        }
      }

      mockedAxios.post.mockRejectedValueOnce(errorResponse)

      await expect(register('existinguser', 'password123')).rejects.toEqual(errorResponse)
    })

    it('should handle validation errors', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: { message: 'Validation failed', errors: ['Username too short'] }
        }
      }

      mockedAxios.post.mockRejectedValueOnce(errorResponse)

      await expect(register('ab', 'pass')).rejects.toEqual(errorResponse)
    })

    it('should handle server errors', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      }

      mockedAxios.post.mockRejectedValueOnce(errorResponse)

      await expect(register('testuser', 'password123')).rejects.toEqual(errorResponse)
    })

    it('should handle network timeout', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded')
      mockedAxios.post.mockRejectedValueOnce(timeoutError)

      await expect(register('testuser', 'password123')).rejects.toThrow('timeout of 5000ms exceeded')
    })
  })

  describe('API endpoint consistency', () => {
    it('should use the same base URL for both login and register', async () => {
      const mockResponse = { data: {} }
      mockedAxios.post.mockResolvedValue(mockResponse)

      await login('user', 'pass')
      await register('user', 'pass')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:5050/api/auth/'),
        expect.any(Object)
      )
    })

    it('should send data in the same format for both endpoints', async () => {
      const mockResponse = { data: {} }
      mockedAxios.post.mockResolvedValue(mockResponse)

      await login('testuser', 'testpass')
      await register('testuser', 'testpass')

      // Both calls should have the same data structure
      expect(mockedAxios.post).toHaveBeenNthCalledWith(1,
        expect.any(String),
        { username: 'testuser', password: 'testpass' }
      )
      expect(mockedAxios.post).toHaveBeenNthCalledWith(2,
        expect.any(String),
        { username: 'testuser', password: 'testpass' }
      )
    })
  })

  describe('Edge cases', () => {
    it('should handle special characters in credentials', async () => {
      const mockResponse = { data: {} }
      mockedAxios.post.mockResolvedValue(mockResponse)

      await login('user@domain.com', 'p@ssw0rd!@#$%')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { username: 'user@domain.com', password: 'p@ssw0rd!@#$%' }
      )
    })

    it('should handle unicode characters', async () => {
      const mockResponse = { data: {} }
      mockedAxios.post.mockResolvedValue(mockResponse)

      await login('用户名', 'пароль123')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { username: '用户名', password: 'пароль123' }
      )
    })

    it('should handle very long credentials', async () => {
      const mockResponse = { data: {} }
      mockedAxios.post.mockResolvedValue(mockResponse)

      const longUsername = 'a'.repeat(1000)
      const longPassword = 'b'.repeat(1000)

      await login(longUsername, longPassword)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { username: longUsername, password: longPassword }
      )
    })
  })
})