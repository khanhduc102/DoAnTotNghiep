// Bao ve trang quan tri: khong chi kiem tra CO token, ma hoi server token thuoc ve ai.
// Token cua TENANT / OWNER (du con han) hoac token da logout deu bi day ve /login.
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import * as authApi from '../api/auth.api';

export default function AdminRoute({ children }) {
  const hasToken = Boolean(localStorage.getItem('token'));
  // 'checking' | 'allowed' | 'denied'
  const [state, setState] = useState(hasToken ? 'checking' : 'denied');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!hasToken) return;
    authApi
      .getMe()
      .then((me) => {
        if (me.role === 'ADMIN') {
          setUser(me);
          setState('allowed');
        } else {
          localStorage.removeItem('token');
          setState('denied');
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        setState('denied');
      });
  }, [hasToken]);

  if (state === 'denied') return <Navigate to="/login" replace />;
  if (state === 'checking') return <p style={{ padding: 32, fontFamily: 'sans-serif' }}>Dang kiem tra quyen truy cap...</p>;

  // Truyen user xuong trang con de khong phai goi /auth/me lan nua
  return children(user);
}
