import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, renderHook, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'

// Mock child component for testing
const TestComponent = ({ onAuthState }: { onAuthState: (auth: any) => void }) => {
  const auth = useAuth()
  onAuthState(auth)
  return <div>Test Component</div>
}

describe('AuthContext', () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }

  beforeEach(() => {
    // Clear localStorage mock calls
    vi.clearAllMocks()
    
    // Reset localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
    
    // Default return null for getItem
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('AuthProvider', () => {
    it('should provide initial state when no token in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      let capturedAuth: any
      render(
        <AuthProvider>
          <TestComponent onAuthState={(auth) => { capturedAuth = auth }} />
        </AuthProvider>
      )

      expect(capturedAuth.token).toBeNull()
      expect(capturedAuth.user).toBeNull()
      expect(capturedAuth.isLoggedIn).toBe(false)
      expect(typeof capturedAuth.login).toBe('function')
      expect(typeof capturedAuth.logout).toBe('function')
    })

    it('should restore state from localStorage', () => {
      const mockToken = 'test-token'
      const mockUser = { _id: '123', username: 'testuser' }
      
      mockLocalStorage.getItem
        .mockReturnValueOnce(mockToken) // for token
        .mockReturnValueOnce(JSON.stringify(mockUser)) // for user

      let capturedAuth: any
      render(
        <AuthProvider>
          <TestComponent onAuthState={(auth) => { capturedAuth = auth }} />
        </AuthProvider>
      )

      expect(capturedAuth.token).toBe(mockToken)
      expect(capturedAuth.user).toEqual(mockUser)
      expect(capturedAuth.isLoggedIn).toBe(true)
    })

    it('should handle corrupted user data in localStorage gracefully', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce('test-token') // for token
        .mockReturnValueOnce('invalid-json') // for user

      // Should not throw error - component should handle gracefully
      let capturedAuth: any
      expect(() => {
        render(
          <AuthProvider>
            <TestComponent onAuthState={(auth) => { capturedAuth = auth }} />
          </AuthProvider>
        )
      }).not.toThrow()
      
      // Should still have token but user might be null
      expect(capturedAuth.token).toBe('test-token')
      expect(capturedAuth.isLoggedIn).toBe(true) // token exists
    })

    it('should handle null user in localStorage', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce('test-token') // for token  
        .mockReturnValueOnce(null) // for user

      let capturedAuth: any
      render(
        <AuthProvider>
          <TestComponent onAuthState={(auth) => { capturedAuth = auth }} />
        </AuthProvider>
      )

      expect(capturedAuth.token).toBe('test-token')
      expect(capturedAuth.user).toBeNull()
      expect(capturedAuth.isLoggedIn).toBe(true) // token exists
    })
  })

  describe('login function', () => {
    it('should update state and localStorage on login', () => {
      let capturedAuth: any
      render(
        <AuthProvider>
          <TestComponent onAuthState={(auth) => { capturedAuth = auth }} />
        </AuthProvider>
      )

      const newToken = 'new-token'
      const newUser = { _id: '456', username: 'newuser' }

      act(() => {
        capturedAuth.login(newToken, newUser)
      })

      expect(capturedAuth.token).toBe(newToken)
      expect(capturedAuth.user).toEqual(newUser)
      expect(capturedAuth.isLoggedIn).toBe(true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', newToken)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(newUser))
    })
  })

  describe('logout function', () => {
    it('should clear state and localStorage on logout', () => {
      // Setup initial logged in state
      mockLocalStorage.getItem
        .mockReturnValueOnce('test-token')
        .mockReturnValueOnce(JSON.stringify({ _id: '123', username: 'testuser' }))

      let capturedAuth: any
      render(
        <AuthProvider>
          <TestComponent onAuthState={(auth) => { capturedAuth = auth }} />
        </AuthProvider>
      )

      // Initially logged in
      expect(capturedAuth.isLoggedIn).toBe(true)

      act(() => {
        capturedAuth.logout()
      })

      expect(capturedAuth.token).toBeNull()
      expect(capturedAuth.user).toBeNull()
      expect(capturedAuth.isLoggedIn).toBe(false)
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = vi.fn()

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used inside AuthProvider')

      console.error = originalError
    })

    it('should return auth context when used inside AuthProvider', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      })

      expect(result.current).toHaveProperty('token')
      expect(result.current).toHaveProperty('user')
      expect(result.current).toHaveProperty('login')
      expect(result.current).toHaveProperty('logout')
      expect(result.current).toHaveProperty('isLoggedIn')
    })
  })

  describe('isLoggedIn computed property', () => {
    it('should return true when token exists', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce('test-token')
        .mockReturnValueOnce(null)

      let capturedAuth: any
      render(
        <AuthProvider>
          <TestComponent onAuthState={(auth) => { capturedAuth = auth }} />
        </AuthProvider>
      )

      expect(capturedAuth.isLoggedIn).toBe(true)
    })

    it('should return false when token is null', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      let capturedAuth: any
      render(
        <AuthProvider>
          <TestComponent onAuthState={(auth) => { capturedAuth = auth }} />
        </AuthProvider>
      )

      expect(capturedAuth.isLoggedIn).toBe(false)
    })

    it('should return false when token is empty string', () => {
      mockLocalStorage.getItem
        .mockReturnValueOnce('')
        .mockReturnValueOnce(null)

      let capturedAuth: any
      render(
        <AuthProvider>
          <TestComponent onAuthState={(auth) => { capturedAuth = auth }} />
        </AuthProvider>
      )

      expect(capturedAuth.isLoggedIn).toBe(false)
    })
  })
})