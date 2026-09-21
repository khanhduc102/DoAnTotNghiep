// Quan ly phien dang nhap: token luu ma hoa trong SecureStore, user lay tu /auth/me.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as authApi from '../api/auth.api';
import { ApiError, setAuthToken, setUnauthorizedHandler } from '../api/client';

const TOKEN_KEY = 'duchome_token';

const AuthContext = createContext(null);

// Tai khoan ADMIN dung web quan tri, khong dung app
const assertMobileRole = (user) => {
  if (user.role === 'ADMIN') {
    throw new ApiError('Tài khoản quản trị vui lòng đăng nhập trên trang web quản trị.', 403);
  }
};

export function AuthProvider({ children }) {
  // status: 'loading' (dang khoi phuc phien) | 'signedOut' | 'signedIn'
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);

  const saveSession = async (token, nextUser) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(nextUser);
    setStatus('signedIn');
  };

  // Xoa phien o may, khong goi server
  const clearSession = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    setStatus('signedOut');
  }, []);

  // Mo app: co token cu thi hoi lai server xem con hop le khong
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
    });

    (async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        setStatus('signedOut');
        return;
      }

      setAuthToken(token);
      try {
        const me = await authApi.getMe();
        assertMobileRole(me);
        setUser(me);
        setStatus('signedIn');
      } catch (err) {
        // Mat mang: giu token de lan mo sau thu lai. Token bi tu choi: xoa han.
        if (err.status === 0) {
          setAuthToken(null);
          setStatus('signedOut');
        } else {
          await clearSession();
        }
      }
    })();
  }, [clearSession]);

  const signIn = useCallback(async (email, password) => {
    const { user: nextUser, token } = await authApi.login(email, password);
    assertMobileRole(nextUser);
    await saveSession(token, nextUser);
  }, []);

  const signUp = useCallback(async (form) => {
    const { user: nextUser, token } = await authApi.register(form);
    await saveSession(token, nextUser);
  }, []);

  // Goi server de thu hoi token (tang tokenVersion), loi mang cung van xoa phien o may
  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // bo qua: phien o may van phai duoc xoa
    }
    await clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ status, user, signIn, signUp, signOut }),
    [status, user, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
