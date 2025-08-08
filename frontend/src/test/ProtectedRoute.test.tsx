import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'

// Mock Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{`Navigate to ${to}`}</div>
  }
})

const TestComponent = () => <div>Protected Content</div>

const renderWithProviders = (children: React.ReactNode, mockToken: string | null = null, mockUser: any = null) => {
  // Create a fresh mock for each test
  const mockGetItem = vi.fn()
    .mockImplementation((key: string) => {
      if (key === 'token') return mockToken
      if (key === 'user') return mockUser ? JSON.stringify(mockUser) : null
      return null
    })

  // Mock localStorage globally for this test
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: mockGetItem,
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true
  })

  return render(
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )
}

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render children when user is logged in', () => {
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      'test-token', // mockToken
      { _id: '123', username: 'testuser' } // mockUser
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
  })

  it('should redirect to login when user is not logged in', () => {
    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      null, // mockToken
      null // mockUser
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
    expect(screen.getByText('Navigate to /login')).toBeInTheDocument()
  })

  it('should render complex children when logged in', () => {
    const ComplexComponent = () => (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to the protected area</p>
        <button>Action Button</button>
      </div>
    )

    renderWithProviders(
      <ProtectedRoute>
        <ComplexComponent />
      </ProtectedRoute>,
      'test-token', // mockToken
      { _id: '123', username: 'testuser' } // mockUser
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome to the protected area')).toBeInTheDocument()
    expect(screen.getByText('Action Button')).toBeInTheDocument()
  })

  it('should redirect to login for complex children when not logged in', () => {
    const ComplexComponent = () => (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to the protected area</p>
        <button>Action Button</button>
      </div>
    )

    renderWithProviders(
      <ProtectedRoute>
        <ComplexComponent />
      </ProtectedRoute>,
      null, // mockToken
      null // mockUser
    )

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(screen.getByTestId('navigate')).toBeInTheDocument()
  })

  describe('Edge cases', () => {
    it('should handle null children when logged in', () => {
      renderWithProviders(
        <ProtectedRoute>
          {null}
        </ProtectedRoute>,
        'test-token', // mockToken
        { _id: '123', username: 'testuser' } // mockUser
      )

      // Should not crash and should not show navigate
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })

    it('should handle undefined children when logged in', () => {
      renderWithProviders(
        <ProtectedRoute>
          {undefined}
        </ProtectedRoute>,
        'test-token', // mockToken
        { _id: '123', username: 'testuser' } // mockUser
      )

      // Should not crash and should not show navigate
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })

    it('should handle empty fragment as children when logged in', () => {
      renderWithProviders(
        <ProtectedRoute>
          <></>
        </ProtectedRoute>,
        'test-token', // mockToken
        { _id: '123', username: 'testuser' } // mockUser
      )

      // Should not crash and should not show navigate
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })

    it('should handle multiple children when logged in', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>First child</div>
          <div>Second child</div>
          <span>Third child</span>
        </ProtectedRoute>,
        'test-token', // mockToken
        { _id: '123', username: 'testuser' } // mockUser
      )

      expect(screen.getByText('First child')).toBeInTheDocument()
      expect(screen.getByText('Second child')).toBeInTheDocument()
      expect(screen.getByText('Third child')).toBeInTheDocument()
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })

    it('should always redirect regardless of children complexity when not logged in', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>First child</div>
          <div>Second child</div>
          <span>Third child</span>
        </ProtectedRoute>,
        null, // mockToken
        null // mockUser
      )

      expect(screen.queryByText('First child')).not.toBeInTheDocument()
      expect(screen.queryByText('Second child')).not.toBeInTheDocument()
      expect(screen.queryByText('Third child')).not.toBeInTheDocument()
      expect(screen.getByTestId('navigate')).toBeInTheDocument()
    })
  })

  describe('Integration with AuthContext', () => {
    it('should work with token but no user', () => {
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        'test-token', // mockToken
        null // mockUser
      )

      // Should render content since token exists (isLoggedIn = !!token)
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument()
    })

    it('should redirect when token is empty string', () => {
      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        '', // mockToken (empty string)
        null // mockUser
      )

      // Empty string is falsy, so should redirect
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      expect(screen.getByTestId('navigate')).toBeInTheDocument()
    })
  })
})