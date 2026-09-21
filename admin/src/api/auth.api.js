import client from './client';

export const login = (email, password) =>
  client.post('/auth/login', { email, password }).then((res) => res.data.data);

export const getMe = () => client.get('/auth/me').then((res) => res.data.data);

// Thu hoi token tren server (moi phien cua tai khoan nay deu het hieu luc)
export const logout = () => client.post('/auth/logout');

// Chi ADMIN goi duoc, vai tro khac nhan 403
export const getAdminDashboard = () => client.get('/admin/dashboard').then((res) => res.data.data);
