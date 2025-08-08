import { describe, it, expect } from 'vitest'
import {
  validateUsername,
  validatePassword,
  validatePasswordConfirmation,
  validateTicketTitle,
  validateTicketDescription,
  validateComment
} from '../utils/validation'

describe('Validation Utils', () => {
  describe('validateUsername', () => {
    it('should return valid for correct username', () => {
      const result = validateUsername('testuser123')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should accept underscores and hyphens', () => {
      expect(validateUsername('test_user-123').isValid).toBe(true)
    })

    it('should reject empty username', () => {
      const result = validateUsername('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username is required')
    })

    it('should reject whitespace-only username', () => {
      const result = validateUsername('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username is required')
    })

    it('should reject username shorter than 3 characters', () => {
      const result = validateUsername('ab')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username must be at least 3 characters long')
    })

    it('should reject username longer than 20 characters', () => {
      const result = validateUsername('a'.repeat(21))
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username must be less than 20 characters')
    })

    it('should reject username with invalid characters', () => {
      const result = validateUsername('test@user!')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username can only contain letters, numbers, underscores, and hyphens')
    })

    it('should reject username with spaces', () => {
      const result = validateUsername('test user')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Username can only contain letters, numbers, underscores, and hyphens')
    })
  })

  describe('validatePassword', () => {
    it('should return valid for correct password', () => {
      const result = validatePassword('password123')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject empty password', () => {
      const result = validatePassword('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Password is required')
    })

    it('should reject password shorter than 6 characters', () => {
      const result = validatePassword('abc12')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Password must be at least 6 characters long')
    })

    it('should reject password longer than 100 characters', () => {
      const result = validatePassword('a'.repeat(101))
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Password must be less than 100 characters')
    })

    it('should reject password without letters', () => {
      const result = validatePassword('123456')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Password must contain at least one letter and one number')
    })

    it('should reject password without numbers', () => {
      const result = validatePassword('password')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Password must contain at least one letter and one number')
    })

    it('should accept complex passwords', () => {
      expect(validatePassword('P@ssw0rd123!').isValid).toBe(true)
    })
  })

  describe('validatePasswordConfirmation', () => {
    it('should return valid for matching passwords', () => {
      const result = validatePasswordConfirmation('password123', 'password123')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject empty confirmation', () => {
      const result = validatePasswordConfirmation('password123', '')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Password confirmation is required')
    })

    it('should reject non-matching passwords', () => {
      const result = validatePasswordConfirmation('password123', 'different123')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Passwords do not match')
    })

    it('should be case sensitive', () => {
      const result = validatePasswordConfirmation('Password123', 'password123')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Passwords do not match')
    })
  })

  describe('validateTicketTitle', () => {
    it('should return valid for correct title', () => {
      const result = validateTicketTitle('Bug fix needed')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject empty title', () => {
      const result = validateTicketTitle('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Title is required')
    })

    it('should reject whitespace-only title', () => {
      const result = validateTicketTitle('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Title is required')
    })

    it('should reject title shorter than 3 characters', () => {
      const result = validateTicketTitle('Hi')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Title must be at least 3 characters long')
    })

    it('should reject title longer than 100 characters', () => {
      const result = validateTicketTitle('a'.repeat(101))
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Title must be less than 100 characters')
    })

    it('should accept title with exactly 100 characters', () => {
      const result = validateTicketTitle('a'.repeat(100))
      expect(result.isValid).toBe(true)
    })

    it('should accept title with special characters', () => {
      const result = validateTicketTitle('Bug: Fix issue #123 - API error!')
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateTicketDescription', () => {
    it('should return valid for empty description', () => {
      const result = validateTicketDescription('')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return valid for valid description', () => {
      const result = validateTicketDescription('This is a detailed description of the issue.')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject description longer than 1000 characters', () => {
      const result = validateTicketDescription('a'.repeat(1001))
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Description must be less than 1000 characters')
    })

    it('should accept description with exactly 1000 characters', () => {
      const result = validateTicketDescription('a'.repeat(1000))
      expect(result.isValid).toBe(true)
    })

    it('should accept description with special characters and newlines', () => {
      const description = 'Steps to reproduce:\n1. Open app\n2. Click button\n3. See error!\n\nExpected: No error\nActual: Error 500'
      const result = validateTicketDescription(description)
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateComment', () => {
    it('should return valid for correct comment', () => {
      const result = validateComment('This is a helpful comment.')
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject empty comment', () => {
      const result = validateComment('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Comment cannot be empty')
    })

    it('should reject whitespace-only comment', () => {
      const result = validateComment('   ')
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Comment cannot be empty')
    })

    it('should reject comment longer than 500 characters', () => {
      const result = validateComment('a'.repeat(501))
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('Comment must be less than 500 characters')
    })

    it('should accept comment with exactly 500 characters', () => {
      const result = validateComment('a'.repeat(500))
      expect(result.isValid).toBe(true)
    })

    it('should accept comment with special characters and newlines', () => {
      const result = validateComment('Great work! 👍\nThis fixes the issue.\n\nThanks @user!')
      expect(result.isValid).toBe(true)
    })
  })
})