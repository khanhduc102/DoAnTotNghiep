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
      .catch((err) => setError(err.response?.data?.message || 'Không tải được số liệu'));
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
        Xin chào <strong>{user.fullName}</strong> ({user.role})
      </p>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {stats && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '20px 0' }}>
          <Stat label="Tổng người dùng" value={stats.users.total} />
          <Stat label="Chủ trọ" value={stats.users.byRole.OWNER} />
          <Stat label="Khách thuê" value={stats.users.byRole.TENANT} />
          <Stat label="Tài khoản bị khóa" value={stats.users.byStatus.LOCKED} />
          <Stat label="Phòng" value={stats.rooms} />
          <Stat label="Tin chờ duyệt" value={stats.pendingPosts} />
        </div>
      )}

      <button onClick={handleLogout} disabled={loggingOut}>
        {loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
      </button>
    </div>
  );
}
