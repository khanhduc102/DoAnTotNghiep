// Trang chu sau khi dang nhap. Noi dung thong ke se lam o tuan 8.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth.api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    authApi.getMe().then(setUser).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>DUCHOME Admin</h1>
      {user ? (
        <p>
          Xin chao <strong>{user.fullName}</strong> ({user.role})
        </p>
      ) : (
        <p>Dang tai...</p>
      )}
      <button onClick={handleLogout}>Dang xuat</button>
    </div>
  );
}
