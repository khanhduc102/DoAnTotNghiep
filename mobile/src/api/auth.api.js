import { request } from './client';

export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: { email, password } });

export const register = (form) => request('/auth/register', { method: 'POST', body: form });

export const logout = () => request('/auth/logout', { method: 'POST' });

export const getMe = () => request('/auth/me');

// Moi vai tro chi goi duoc dashboard cua chinh minh (backend tra 403 neu goi sai)
export const getTenantDashboard = () => request('/tenant/dashboard');

export const getOwnerDashboard = () => request('/owner/dashboard');
