import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const { exchangeSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = location.hash?.startsWith('#') ? location.hash.slice(1) : location.hash || '';
    // console.log('AuthCallback hash:', hash);
    const params = new URLSearchParams(hash);
    const sessionId = params.get('session_id');
    // console.log('AuthCallback sessionId:', sessionId);

    if (!sessionId) {
      // console.log('No session_id found, redirecting home');
      navigate('/', { replace: true });
      return;
    }

    const process = async () => {
      try {
        // console.log('Exchanging session...');
        const userData = await exchangeSession(sessionId);
        // console.log('Session exchanged successfully:', userData);
        toast.success(`Welcome, ${userData.name}!`);
        window.history.replaceState(null, '', '/');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error?.response?.data || error);
        toast.error('Login failed. Please try again.');
        window.history.replaceState(null, '', '/login');
        navigate('/login', { replace: true });
      }
    };

    process();
  }, [exchangeSession, navigate, location.hash]);

  return (
    <div className="pt-24 min-h-screen bg-bree-bg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 mx-auto text-bree-primary animate-spin mb-4" />
        <p className="text-bree-text-secondary">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
