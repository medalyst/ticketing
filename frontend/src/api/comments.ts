import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

export interface Comment {
    _id: string;
    content: string;
    ticketId: string;
    userId: string;
    username: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCommentData {
    content: string;
    ticketId: string;
}

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Create axios instance with auth header
const createAuthHeaders = () => ({
    Authorization: `Bearer ${getAuthToken()}`,
});

export const getComments = async (ticketId: string): Promise<Comment[]> => {
    const res = await axios.get(`${BASE_URL}/comments/ticket/${ticketId}`, {
        headers: createAuthHeaders(),
    });
    return res.data;
};

export const createComment = async (commentData: CreateCommentData): Promise<Comment> => {
    const res = await axios.post(`${BASE_URL}/comments`, commentData, {
        headers: createAuthHeaders(),
    });
    return res.data;
};

export const deleteComment = async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/comments/${id}`, {
        headers: createAuthHeaders(),
    });
};