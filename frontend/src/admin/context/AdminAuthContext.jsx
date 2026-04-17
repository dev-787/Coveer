import { createContext, useContext, useEffect, useState } from 'react';
import adminApi from '../api/adminApi';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/auth/me')
      .then(r => setAdmin(r.data))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await adminApi.post('/auth/logout').catch(() => {});
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, setAdmin, loading, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
