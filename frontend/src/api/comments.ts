import type { Comment } from '../../../shared/types/comment';
import axios from 'axios';


const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

function getAuthHeaders() {
  // The backend expects the token as 'Bearer <token>' in the Authorization header
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const fetchComments = async (ticketId: string): Promise<Comment[]> => {
  const res = await axios.get(`${BASE_URL}/comments/${ticketId}`, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const addComment = async (ticketId: string, content: string): Promise<Comment> => {
  const res = await axios.post(
    `${BASE_URL}/comments/${ticketId}`,
    { content },
    { headers: getAuthHeaders() }
  );
  return res.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/comments/${commentId}`, {
    headers: getAuthHeaders(),
  });
};
