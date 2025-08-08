import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '../components/Modal'

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Test Modal',
    children: <div>Modal content</div>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset body overflow
    document.body.style.overflow = 'unset'
  })

  afterEach(() => {
    // Clean up after each test
    document.body.style.overflow = 'unset'
  })

  it('should render when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('should not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()
    
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByRole('button')
    await user.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when Escape key is pressed', () => {
    const onClose = vi.fn()
    
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Escape' })
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should not call onClose when other keys are pressed', () => {
    const onClose = vi.fn()
    
    render(<Modal {...defaultProps} onClose={onClose} />)
    
    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.keyDown(document, { key: 'Space' })
    fireEvent.keyDown(document, { key: 'Tab' })
    
    expect(onClose).not.toHaveBeenCalled()
  })

  it('should set body overflow to hidden when modal is open', () => {
    render(<Modal {...defaultProps} />)
    
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('should restore body overflow when modal is closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />)
    
    expect(document.body.style.overflow).toBe('hidden')
    
    rerender(<Modal {...defaultProps} isOpen={false} />)
    
    expect(document.body.style.overflow).toBe('unset')
  })

  it('should clean up event listeners on unmount', () => {
    const onClose = vi.fn()
    const { unmount } = render(<Modal {...defaultProps} onClose={onClose} />)
    
    unmount()
    
    // After unmount, escape should not trigger onClose
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  describe('Max width variants', () => {
    it('should apply small max width class', () => {
      render(<Modal {...defaultProps} maxWidth="sm" />)
      
      const modalContent = screen.getByText('Test Modal').closest('.bg-white')
      expect(modalContent).toHaveClass('max-w-sm')
    })

    it('should apply medium max width class by default', () => {
      render(<Modal {...defaultProps} />)
      
      const modalContent = screen.getByText('Test Modal').closest('.bg-white')
      expect(modalContent).toHaveClass('max-w-md')
    })

    it('should apply large max width class', () => {
      render(<Modal {...defaultProps} maxWidth="lg" />)
      
      const modalContent = screen.getByText('Test Modal').closest('.bg-white')
      expect(modalContent).toHaveClass('max-w-lg')
    })

    it('should apply extra large max width class', () => {
      render(<Modal {...defaultProps} maxWidth="xl" />)
      
      const modalContent = screen.getByText('Test Modal').closest('.bg-white')
      expect(modalContent).toHaveClass('max-w-xl')
    })
  })

  describe('Event handling', () => {
    it('should stop propagation when clicking on modal content', () => {
      const onClose = vi.fn()
      
      render(<Modal {...defaultProps} onClose={onClose} />)
      
      const modalContent = screen.getByText('Test Modal').closest('.bg-white')
      fireEvent.click(modalContent!)
      
      // onClose should not be called when clicking on modal content
      expect(onClose).not.toHaveBeenCalled()
    })

    it('should prevent event listeners from being added when modal is closed', () => {
      const onClose = vi.fn()
      
      render(<Modal {...defaultProps} isOpen={false} onClose={onClose} />)
      
      fireEvent.keyDown(document, { key: 'Escape' })
      
      // Should not call onClose since modal is closed
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('Styling and layout', () => {
    it('should have proper overlay styling', () => {
      render(<Modal {...defaultProps} />)
      
      const overlay = screen.getByText('Test Modal').closest('.fixed')
      expect(overlay).toHaveClass(
        'fixed',
        'inset-0',
        'bg-black/50',
        'flex',
        'items-center',
        'justify-center',
        'p-4',
        'z-50',
        'animate-fade-in'
      )
    })

    it('should have proper modal content styling', () => {
      render(<Modal {...defaultProps} />)
      
      const modalContent = screen.getByText('Test Modal').closest('.bg-white')
      expect(modalContent).toHaveClass(
        'bg-white',
        'rounded-lg',
        'shadow-xl',
        'w-full',
        'animate-scale-in'
      )
    })

    it('should have proper header styling', () => {
      render(<Modal {...defaultProps} />)
      
      const header = screen.getByText('Test Modal').closest('.flex')
      expect(header).toHaveClass(
        'flex',
        'items-center',
        'justify-between',
        'p-6',
        'border-b',
        'border-gray-200'
      )
    })

    it('should have proper content area styling', () => {
      render(<Modal {...defaultProps} />)
      
      const content = screen.getByText('Modal content').closest('.p-6')
      expect(content).toHaveClass('p-6')
    })
  })

  describe('Accessibility', () => {
    it('should have proper title styling', () => {
      render(<Modal {...defaultProps} />)
      
      const title = screen.getByText('Test Modal')
      expect(title).toHaveClass(
        'text-lg',
        'font-semibold',
        'text-gray-900'
      )
    })

    it('should have close button with proper styling', () => {
      render(<Modal {...defaultProps} />)
      
      const closeButton = screen.getByRole('button')
      expect(closeButton).toHaveClass(
        'text-gray-400',
        'hover:text-gray-600',
        'transition-colors',
        'duration-200'
      )
    })

    it('should render children content correctly', () => {
      const complexChildren = (
        <div>
          <h4>Complex Content</h4>
          <p>This is a paragraph</p>
          <button>Action Button</button>
        </div>
      )
      
      render(<Modal {...defaultProps} children={complexChildren} />)
      
      expect(screen.getByText('Complex Content')).toBeInTheDocument()
      expect(screen.getByText('This is a paragraph')).toBeInTheDocument()
      expect(screen.getByText('Action Button')).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle rapid open/close toggling', () => {
      const onClose = vi.fn()
      const { rerender } = render(<Modal {...defaultProps} isOpen={false} onClose={onClose} />)
      
      // Open
      rerender(<Modal {...defaultProps} isOpen={true} onClose={onClose} />)
      expect(document.body.style.overflow).toBe('hidden')
      
      // Close
      rerender(<Modal {...defaultProps} isOpen={false} onClose={onClose} />)
      expect(document.body.style.overflow).toBe('unset')
      
      // Open again
      rerender(<Modal {...defaultProps} isOpen={true} onClose={onClose} />)
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should handle empty title', () => {
      render(<Modal {...defaultProps} title="" />)
      
      const titleElement = screen.getByRole('heading', { level: 3 })
      expect(titleElement).toBeInTheDocument()
      expect(titleElement).toHaveTextContent('')
    })

    it('should handle undefined onClose gracefully', () => {
      // This should not crash the component
      expect(() => {
        render(<Modal {...defaultProps} onClose={undefined as any} />)
      }).not.toThrow()
    })
  })
})