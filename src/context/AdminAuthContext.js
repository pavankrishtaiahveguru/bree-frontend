import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from '@/lib/api';
import { toast } from 'sonner';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);

  const verifyAdmin = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/me');
      setAdmin(data.admin || null);
      return data.admin || null;
    } catch (error) {
      setAdmin(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAdmin();
  }, [verifyAdmin]);

  const loginAdmin = async (email, password) => {
    setAuthenticating(true);
    try {
      const { data } = await axios.post('/api/admin/login', { email, password });
      setAdmin(data.admin || null);
      return data.admin;
    } catch (error) {
      throw error;
    } finally {
      setAuthenticating(false);
    }
  };

  const logoutAdmin = async () => {
    try {
      await axios.post('/api/admin/logout');
    } catch (err) {
      toast.error('Unable to log out cleanly. You will still be signed out locally.');
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, authenticating, loginAdmin, logoutAdmin, verifyAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
