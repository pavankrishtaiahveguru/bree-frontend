import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map(e => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  return String(detail);
}

const Login = () => {
  const { loginWithGoogle, loginEmail, registerEmail, authenticating } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const redirectPath = location.state?.from || '/';

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (mode === 'register' && !formData.name) {
      toast.error('Please enter your name');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        await registerEmail(formData.name, formData.email, formData.password);
        toast.success('Account created!');
      } else {
        await loginEmail(formData.email, formData.password);
        toast.success('Welcome back!');
      }
      navigate(redirectPath, { replace: true });
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.message || error.response?.data?.detail || error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login — BREE Wellness</title>
        <meta name="description" content="Sign in to your BREE account to manage orders, addresses, and your wellness subscription." />
      </Helmet>
    <div className="pt-24 min-h-screen bg-bree-bg flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 md:p-10 rounded-3xl shadow-sm"
        >
          <div className="text-center mb-8">
            <span className="text-xs tracking-[0.2em] uppercase font-semibold text-bree-primary">
              {mode === 'login' ? 'Welcome Back' : 'Join BREE'}
            </span>
            <h1 className="font-outfit text-3xl font-light text-bree-text-primary mt-2">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h1>
          </div>

          {/* Google Login Button */}
          <button
            onClick={async () => {
              try {
                setIsLoading(true);
                await loginWithGoogle();
                navigate(redirectPath, { replace: true });
              } catch (error) {
                // error handled in AuthContext
              } finally {
                setIsLoading(false);
              }
            }}
            data-testid="google-login-btn"
            disabled={authenticating || isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-bree-border rounded-full hover:bg-bree-bg transition-colors mb-6 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {authenticating ? (
              <span className="flex items-center gap-2 font-medium text-bree-text-primary">
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span className="font-medium text-bree-text-primary">Continue with Google</span>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-bree-border" />
            <span className="text-sm text-bree-text-secondary">or</span>
            <div className="flex-1 h-px bg-bree-border" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="email-auth-form">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-bree-text-primary">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bree-text-secondary" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    data-testid="auth-name"
                    className="pl-10 rounded-xl border-bree-border"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-bree-text-primary">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bree-text-secondary" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  data-testid="auth-email"
                  className="pl-10 rounded-xl border-bree-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-bree-text-primary">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bree-text-secondary" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  data-testid="auth-password"
                  className="pl-10 rounded-xl border-bree-border"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              data-testid="auth-submit"
              className="w-full bg-bree-primary hover:bg-bree-primary-hover text-white py-6 rounded-full font-medium"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {mode === 'register' ? 'Creating...' : 'Signing in...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {mode === 'register' ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-bree-text-secondary text-sm mt-6">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-bree-primary font-medium hover:underline"
                  data-testid="switch-to-register"
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-bree-primary font-medium hover:underline"
                  data-testid="switch-to-login"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
};

export default Login;