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

export interface GetTicketsParams {
    search?: string;
    status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
    sortBy?: 'createdAt' | 'title';
    sortOrder?: 'asc' | 'desc';
}

export const getTickets = async (params?: GetTicketsParams): Promise<Ticket[]> => {
    const queryParams = new URLSearchParams();

    if (params) {
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${BASE_URL}/tickets?${queryString}` : `${BASE_URL}/tickets`;

    const res = await axios.get(url, {
        headers: createAuthHeaders(),
    });
    return res.data;
};

export const getTicket = async (id: string): Promise<Ticket> => {
    const res = await axios.get(`${BASE_URL}/tickets/${id}`, {
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
