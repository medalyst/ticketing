import type { Comment } from '../../../shared/types/comment';
import axios from 'axios';

const API_URL = '/api/comments';

export const fetchComments = async (ticketId: string): Promise<Comment[]> => {
  const res = await axios.get(`${API_URL}/${ticketId}`);
  return res.data;
};

export const addComment = async (ticketId: string, content: string): Promise<Comment> => {
  const res = await axios.post(`${API_URL}/${ticketId}`, { content });
  return res.data;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  await axios.delete(`${API_URL}/${commentId}`);
};
