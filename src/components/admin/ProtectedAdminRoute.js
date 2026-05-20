import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';

/**
 * ProtectedAdminRoute
 * 
 * Guards admin routes using an httpOnly admin auth cookie.
 * Verifies the session with GET /api/admin/me before allowing access.
 */

const ProtectedAdminRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-bree-text-secondary">Verifying admin session…</p>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;