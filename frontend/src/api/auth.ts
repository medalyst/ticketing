import axios from 'axios';

const BASE_URL = 'http://localhost:5050/api';

export const login = async (username: string, password: string) => {
  const res = await axios.post(`${BASE_URL}/auth/login`, { username, password });
  return res.data.token;
};

export const register = async (username: string, password: string) => {
  const res = await axios.post(`${BASE_URL}/auth/register`, { username, password });
  return res.data;
};
