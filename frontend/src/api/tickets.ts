import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

export interface Ticket {
  _id: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketData {
  title: string;
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
}

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Create axios instance with auth header
const createAuthHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
});

export const getTickets = async (): Promise<Ticket[]> => {
  const res = await axios.get(`${BASE_URL}/tickets`, {
    headers: createAuthHeaders(),
  });
  return res.data;
};

export const createTicket = async (ticketData: CreateTicketData): Promise<Ticket> => {
  const res = await axios.post(`${BASE_URL}/tickets`, ticketData, {
    headers: createAuthHeaders(),
  });
  return res.data;
};

export const updateTicket = async (id: string, ticketData: UpdateTicketData): Promise<Ticket> => {
  const res = await axios.put(`${BASE_URL}/tickets/${id}`, ticketData, {
    headers: createAuthHeaders(),
  });
  return res.data;
};

export const deleteTicket = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/tickets/${id}`, {
    headers: createAuthHeaders(),
  });
};
