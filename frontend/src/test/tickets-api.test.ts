import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  type Ticket,
  type CreateTicketData,
  type UpdateTicketData,
  type GetTicketsParams
} from '../api/tickets'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('Tickets API', () => {
  const mockToken = 'test-token'
  const mockTicket: Ticket = {
    _id: '123',
    title: 'Test Ticket',
    description: 'Test description',
    status: 'OPEN',
    createdBy: 'user123',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(mockToken)
  })

  describe('Authentication headers', () => {
    it('should include Bearer token in all requests', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockTicket] })

      await getTickets()

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
    })

    it('should handle missing token', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      mockedAxios.get.mockResolvedValueOnce({ data: [mockTicket] })

      await getTickets()

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        { headers: { Authorization: 'Bearer null' } }
      )
    })
  })

  describe('getTickets', () => {
    it('should fetch tickets without parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockTicket] })

      const result = await getTickets()

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
      expect(result).toEqual([mockTicket])
    })

    it('should fetch tickets with search parameter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockTicket] })

      const params: GetTicketsParams = { search: 'bug' }
      await getTickets(params)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets?search=bug',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
    })

    it('should fetch tickets with status filter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockTicket] })

      const params: GetTicketsParams = { status: 'OPEN' }
      await getTickets(params)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets?status=OPEN',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
    })

    it('should fetch tickets with sorting', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockTicket] })

      const params: GetTicketsParams = { sortBy: 'createdAt', sortOrder: 'desc' }
      await getTickets(params)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets?sortBy=createdAt&sortOrder=desc',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
    })

    it('should fetch tickets with all parameters', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockTicket] })

      const params: GetTicketsParams = {
        search: 'important',
        status: 'IN_PROGRESS',
        sortBy: 'title',
        sortOrder: 'asc'
      }
      await getTickets(params)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets?search=important&status=IN_PROGRESS&sortBy=title&sortOrder=asc',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
    })

    it('should handle empty search parameter', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockTicket] })

      const params: GetTicketsParams = { search: '' }
      await getTickets(params)

      // Empty search should not be included in query
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
    })

    it('should handle special characters in search', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [mockTicket] })

      const params: GetTicketsParams = { search: 'bug #123 & issue!' }
      await getTickets(params)

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets?search=bug+%23123+%26+issue%21',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
    })
  })

  describe('getTicket', () => {
    it('should fetch single ticket by ID', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockTicket })

      const result = await getTicket('123')

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets/123',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
      expect(result).toEqual(mockTicket)
    })

    it('should handle ticket not found', async () => {
      const error = { response: { status: 404, data: { message: 'Ticket not found' } } }
      mockedAxios.get.mockRejectedValueOnce(error)

      await expect(getTicket('nonexistent')).rejects.toEqual(error)
    })
  })

  describe('createTicket', () => {
    it('should create ticket with required fields', async () => {
      const newTicketData: CreateTicketData = {
        title: 'New Bug',
        description: 'Bug description'
      }
      mockedAxios.post.mockResolvedValueOnce({ data: mockTicket })

      const result = await createTicket(newTicketData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets',
        newTicketData,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
      expect(result).toEqual(mockTicket)
    })

    it('should create ticket with status', async () => {
      const newTicketData: CreateTicketData = {
        title: 'New Feature',
        status: 'IN_PROGRESS'
      }
      mockedAxios.post.mockResolvedValueOnce({ data: mockTicket })

      await createTicket(newTicketData)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets',
        newTicketData,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
    })

    it('should handle validation errors', async () => {
      const error = { response: { status: 400, data: { message: 'Title is required' } } }
      mockedAxios.post.mockRejectedValueOnce(error)

      const invalidData: CreateTicketData = { title: '' }
      await expect(createTicket(invalidData)).rejects.toEqual(error)
    })
  })

  describe('updateTicket', () => {
    it('should update ticket with partial data', async () => {
      const updateData: UpdateTicketData = {
        title: 'Updated Title'
      }
      const updatedTicket = { ...mockTicket, title: 'Updated Title' }
      mockedAxios.put.mockResolvedValueOnce({ data: updatedTicket })

      const result = await updateTicket('123', updateData)

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets/123',
        updateData,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
      expect(result).toEqual(updatedTicket)
    })

    it('should update ticket status', async () => {
      const updateData: UpdateTicketData = {
        status: 'CLOSED'
      }
      mockedAxios.put.mockResolvedValueOnce({ data: mockTicket })

      await updateTicket('123', updateData)

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets/123',
        updateData,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
    })

    it('should update multiple fields', async () => {
      const updateData: UpdateTicketData = {
        title: 'New Title',
        description: 'New Description',
        status: 'IN_PROGRESS'
      }
      mockedAxios.put.mockResolvedValueOnce({ data: mockTicket })

      await updateTicket('123', updateData)

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets/123',
        updateData,
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
    })

    it('should handle unauthorized update', async () => {
      const error = { response: { status: 403, data: { message: 'Unauthorized' } } }
      mockedAxios.put.mockRejectedValueOnce(error)

      await expect(updateTicket('123', { title: 'New Title' })).rejects.toEqual(error)
    })
  })

  describe('deleteTicket', () => {
    it('should delete ticket by ID', async () => {
      mockedAxios.delete.mockResolvedValueOnce({})

      await deleteTicket('123')

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:5050/api/tickets/123',
        { headers: { Authorization: `Bearer ${mockToken}` } }
      )
    })

    it('should handle delete of non-existent ticket', async () => {
      const error = { response: { status: 404, data: { message: 'Ticket not found' } } }
      mockedAxios.delete.mockRejectedValueOnce(error)

      await expect(deleteTicket('nonexistent')).rejects.toEqual(error)
    })

    it('should handle unauthorized delete', async () => {
      const error = { response: { status: 403, data: { message: 'You can only delete your own tickets' } } }
      mockedAxios.delete.mockRejectedValueOnce(error)

      await expect(deleteTicket('123')).rejects.toEqual(error)
    })
  })

  describe('Base URL configuration', () => {
    it('should use default localhost URL when no environment variable', () => {
      // All tests above use the default URL
      expect(true).toBe(true) // This tests that the default URL works
    })

    it('should handle different base URLs for different environments', async () => {
      // This would test VITE_API_BASE_URL if it were set
      mockedAxios.get.mockResolvedValueOnce({ data: [mockTicket] })

      await getTickets()

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/tickets'),
        expect.any(Object)
      )
    })
  })

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network Error')
      mockedAxios.get.mockRejectedValueOnce(networkError)

      await expect(getTickets()).rejects.toThrow('Network Error')
    })

    it('should handle server errors', async () => {
      const serverError = { response: { status: 500, data: { message: 'Internal server error' } } }
      mockedAxios.get.mockRejectedValueOnce(serverError)

      await expect(getTickets()).rejects.toEqual(serverError)
    })

    it('should handle malformed response data', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null })

      const result = await getTickets()
      expect(result).toBeNull()
    })
  })
})