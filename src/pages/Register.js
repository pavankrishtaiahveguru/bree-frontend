import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map(e => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  return String(detail);
}

const Register = () => {
  const { sendOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = name+mobile, 2 = otp
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!mobile.trim() || mobile.length < 10) {
      toast.error('Please enter a valid mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendOtp(mobile);
      if (result.dev_otp) {
        toast.success(`OTP sent! Your OTP is: ${result.dev_otp}`, { duration: 10000 });
      } else {
        toast.success('OTP sent to your mobile number');
      }
      setStep(2);
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.detail));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 4) {
      toast.error('Please enter the 4-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(name, mobile, otp);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.detail));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const result = await sendOtp(mobile);
      if (result.dev_otp) {
        toast.success(`OTP resent! Your OTP is: ${result.dev_otp}`, { duration: 10000 });
      } else {
        toast.success('OTP resent');
      }
    } catch (error) {
      toast.error(formatApiError(error.response?.data?.detail));
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              Join BREE
            </span>
            <h1 className="font-outfit text-3xl font-light text-bree-text-primary mt-2">
              Create Account
            </h1>
            {step === 2 && (
              <p className="text-bree-text-secondary text-sm mt-2">
                Enter the OTP sent to {mobile}
              </p>
            )}
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5" data-testid="register-form">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-bree-text-primary">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bree-text-secondary" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    data-testid="register-name"
                    className="pl-10 rounded-xl border-bree-border focus:border-bree-primary focus:ring-bree-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-bree-text-primary">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bree-text-secondary" />
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    data-testid="register-mobile"
                    className="pl-10 rounded-xl border-bree-border focus:border-bree-primary focus:ring-bree-primary"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                data-testid="register-send-otp"
                className="w-full bg-bree-primary hover:bg-bree-primary-hover text-white py-6 rounded-full font-medium"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending OTP...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Get OTP
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6" data-testid="otp-form">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={4}
                  value={otp}
                  onChange={setOtp}
                  data-testid="otp-input"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="w-14 h-14 text-2xl border-bree-border" />
                    <InputOTPSlot index={1} className="w-14 h-14 text-2xl border-bree-border" />
                    <InputOTPSlot index={2} className="w-14 h-14 text-2xl border-bree-border" />
                    <InputOTPSlot index={3} className="w-14 h-14 text-2xl border-bree-border" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="submit"
                disabled={isLoading || otp.length !== 4}
                data-testid="register-verify-otp"
                className="w-full bg-bree-primary hover:bg-bree-primary-hover text-white py-6 rounded-full font-medium"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify & Create Account'
                )}
              </Button>

              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); }}
                  className="text-bree-text-secondary hover:text-bree-primary"
                  data-testid="register-back"
                >
                  Change number
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="text-bree-primary font-medium hover:underline"
                  data-testid="register-resend"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-bree-text-secondary text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-bree-primary font-medium hover:underline">
              Log In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
