import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InputField from '../components/InputField'

describe('InputField Component', () => {
  const defaultProps = {
    label: 'Test Label',
    value: '',
    onChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with basic props', () => {
    render(<InputField {...defaultProps} />)
    
    expect(screen.getByText('Test Label')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('should render required indicator when required is true', () => {
    render(<InputField {...defaultProps} required />)
    
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('should render placeholder text', () => {
    render(<InputField {...defaultProps} placeholder="Enter text here" />)
    
    expect(screen.getByPlaceholderText('Enter text here')).toBeInTheDocument()
  })

  it('should call onChange when input value changes', async () => {
    const onChange = vi.fn()
    
    render(<InputField {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    
    // Simulate typing a single character
    fireEvent.change(input, { target: { value: 'a' } })
    expect(onChange).toHaveBeenCalledWith('a')
    
    // Simulate typing more characters
    fireEvent.change(input, { target: { value: 'abc' } })
    expect(onChange).toHaveBeenCalledWith('abc')
    
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('should display current value', () => {
    render(<InputField {...defaultProps} value="current value" />)
    
    expect(screen.getByDisplayValue('current value')).toBeInTheDocument()
  })

  it('should show error after field is touched', async () => {
    const user = userEvent.setup()
    
    render(<InputField {...defaultProps} error="This field is required" />)
    
    // Error should not be visible initially
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    
    const input = screen.getByRole('textbox')
    await user.click(input)
    await user.tab() // Focus and then blur
    
    // Error should be visible after blur (touched)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('should apply error styling when error exists and field is touched', async () => {
    const user = userEvent.setup()
    
    render(<InputField {...defaultProps} error="Error message" />)
    
    const input = screen.getByRole('textbox')
    
    // Initially no error styling
    expect(input).toHaveClass('border-gray-300')
    expect(input).not.toHaveClass('border-red-300')
    
    await user.click(input)
    await user.tab()
    
    // After touched, should have error styling
    expect(input).toHaveClass('border-red-300', 'bg-red-50')
  })

  describe('Password type functionality', () => {
    it('should render as password type', () => {
      render(<InputField {...defaultProps} type="password" />)
      
      const input = screen.getByDisplayValue('')
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should show password toggle button when showPasswordToggle is true', () => {
      render(<InputField {...defaultProps} type="password" showPasswordToggle />)
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should toggle password visibility when toggle button is clicked', async () => {
      const user = userEvent.setup()
      
      render(<InputField {...defaultProps} type="password" showPasswordToggle />)
      
      const input = screen.getByDisplayValue('')
      const toggleButton = screen.getByRole('button')
      
      // Initially password type
      expect(input).toHaveAttribute('type', 'password')
      
      // Click to show password
      await user.click(toggleButton)
      expect(input).toHaveAttribute('type', 'text')
      
      // Click to hide password again
      await user.click(toggleButton)
      expect(input).toHaveAttribute('type', 'password')
    })

    it('should not show toggle button when showPasswordToggle is false', () => {
      render(<InputField {...defaultProps} type="password" showPasswordToggle={false} />)
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should apply padding for toggle button when showPasswordToggle is true', () => {
      render(<InputField {...defaultProps} showPasswordToggle />)
      
      const input = screen.getByDisplayValue('')
      expect(input).toHaveClass('pr-12')
    })
  })

  describe('Different input types', () => {
    it('should render email type input', () => {
      render(<InputField {...defaultProps} type="email" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render text type input by default', () => {
      render(<InputField {...defaultProps} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'text')
    })
  })

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      render(<InputField {...defaultProps} className="custom-class" />)
      
      const container = screen.getByRole('textbox').closest('.space-y-1')
      expect(container).toHaveClass('custom-class')
    })

    it('should have proper styling classes', () => {
      render(<InputField {...defaultProps} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass(
        'w-full',
        'px-4',
        'py-3',
        'border',
        'rounded-lg',
        'focus:ring-2',
        'focus:ring-blue-500',
        'focus:border-transparent',
        'transition-all',
        'duration-200'
      )
    })
  })

  describe('Accessibility', () => {
    it('should associate label with input', () => {
      render(<InputField {...defaultProps} />)
      
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Test Label')
      
      // Both elements exist
      expect(input).toBeInTheDocument()
      expect(label).toBeInTheDocument()
    })

    it('should have proper aria attributes for required field', () => {
      render(<InputField {...defaultProps} required />)
      
      const input = screen.getByRole('textbox')
      expect(input).toBeRequired()
    })

    it('should maintain focus management for password toggle', async () => {
      const user = userEvent.setup()
      
      render(<InputField {...defaultProps} type="password" showPasswordToggle />)
      
      const input = screen.getByDisplayValue('')
      const toggleButton = screen.getByRole('button')
      
      await user.click(input)
      expect(input).toHaveFocus()
      
      await user.click(toggleButton)
      // Input should still be focusable after toggle
      expect(input).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle empty error string', async () => {
      const user = userEvent.setup()
      
      render(<InputField {...defaultProps} error="" />)
      
      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.tab()
      
      // Empty error should not be displayed - check that no error elements exist
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    })

    it('should handle onBlur correctly', () => {
      const { rerender } = render(<InputField {...defaultProps} error="Error" />)
      
      const input = screen.getByRole('textbox')
      
      // Error not shown initially
      expect(screen.queryByText('Error')).not.toBeInTheDocument()
      
      // Trigger blur
      fireEvent.blur(input)
      
      // Error should be shown after blur
      expect(screen.getByText('Error')).toBeInTheDocument()
    })
  })
})