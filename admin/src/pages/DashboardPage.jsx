// Trang chu sau khi dang nhap. Bieu do va thong ke chi tiet se lam o tuan 8.
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth.api';

const cardStyle = {
  border: '1px solid #c8ccd2',
  borderRadius: 8,
  padding: '12px 16px',
  minWidth: 140,
};

function Stat({ label, value }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function DashboardPage({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    authApi
      .getAdminDashboard()
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || 'Khong tai duoc so lieu'));
  }, []);

  // Goi server thu hoi token truoc, loi mang van xoa token o trinh duyet
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // bo qua
    }
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>DUCHOME Admin</h1>
      <p>
        Xin chao <strong>{user.fullName}</strong> ({user.role})
      </p>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {stats && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '20px 0' }}>
          <Stat label="Tong nguoi dung" value={stats.users.total} />
          <Stat label="Chu tro" value={stats.users.byRole.OWNER} />
          <Stat label="Khach thue" value={stats.users.byRole.TENANT} />
          <Stat label="Tai khoan bi khoa" value={stats.users.byStatus.LOCKED} />
          <Stat label="Phong" value={stats.rooms} />
          <Stat label="Tin cho duyet" value={stats.pendingPosts} />
        </div>
      )}

      <button onClick={handleLogout} disabled={loggingOut}>
        {loggingOut ? 'Dang dang xuat...' : 'Dang xuat'}
      </button>
    </div>
  );
}
