import client from './client';

export const login = (email, password) =>
  client.post('/auth/login', { email, password }).then((res) => res.data.data);

export const getMe = () => client.get('/auth/me').then((res) => res.data.data);
