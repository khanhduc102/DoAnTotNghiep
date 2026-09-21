// Trang dang nhap cho ADMIN. Giao dien se lam lai o tuan sau theo thiet ke Figma.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth.api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authApi.login(email, password);

      // Web quan tri chi danh cho ADMIN
      if (result.user.role !== 'ADMIN') {
        setError('Tai khoan nay khong co quyen truy cap trang quan tri');
        return;
      }

      localStorage.setItem('token', result.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Khong ket noi duoc may chu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h1>DUCHOME Admin</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Mat khau</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
          {loading ? 'Dang xu ly...' : 'Dang nhap'}
        </button>
      </form>
    </div>
  );
}
