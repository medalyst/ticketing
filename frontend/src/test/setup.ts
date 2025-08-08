import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock console.error to keep test output clean
const originalError = console.error
console.error = (...args: any[]) => {
  if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('validateDOMNesting')) {
    return
  }
  originalError.call(console, ...args)
}

// Reset localStorage before each test
beforeEach(() => {
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
})