import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { ShieldCheck, Mail, Lock, User as UserIcon, Briefcase, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react';

const Register = () => {
  const { register, verifySignupOtp, isAuthenticated, user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen'
  });
  const [loading, setLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [timer, setTimer] = useState(60);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/citizen/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (showOtpScreen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showOtpScreen, timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    const result = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.role
    );
    setLoading(false);

    if (result.success) {
      setRegisteredEmail(formData.email);
      setShowOtpScreen(true);
      setTimer(60);
      showToast('Registration successful! Verification code sent.', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      showToast('Please enter a valid 6-digit verification code.', 'error');
      return;
    }

    setOtpLoading(true);
    const result = await verifySignupOtp(registeredEmail, otpCode);
    setOtpLoading(false);

    if (result.success) {
      showToast('Account verified successfully! You can now log in.', 'success');
      setFormData({ username: '', email: '', password: '', confirmPassword: '', role: 'citizen' });
      navigate('/login');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setOtpLoading(true);
    const result = await register(
      formData.username,
      registeredEmail,
      formData.password,
      formData.role
    );
    setOtpLoading(false);
    if (result.success) {
      showToast('A new verification code has been sent.', 'success');
      setOtpCode('');
      setTimer(60);
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-darkBg transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 p-8 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-darkCard shadow-xl animate-fade-in">
        
        {showOtpScreen ? (
          /* OTP Screen */
          <div className="space-y-6">
            <button
              onClick={() => {
                setShowOtpScreen(false);
                setOtpCode('');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign Up
            </button>

            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center">
                <KeyRound className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Verify Your Email</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We've sent a 6-digit registration code to <span className="font-semibold text-slate-700 dark:text-slate-300">{registeredEmail}</span>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-center">
                  Registration OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                  placeholder="000000"
                  className="w-full text-center py-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent text-2xl font-extrabold tracking-[12px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none placeholder:tracking-normal placeholder:font-normal placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading || otpCode.length !== 6}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {otpLoading ? 'Verifying...' : 'Verify Email Address'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1.5">
              <span>Didn't receive the verification code?</span>
              {timer > 0 ? (
                <span className="text-slate-400 dark:text-slate-500 font-semibold text-xs">
                  Resend code in {timer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="text-primary-600 dark:text-primary-400 font-bold hover:underline self-center disabled:opacity-50"
                >
                  Resend Verification OTP
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Normal Registration Form */
          <>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create Account</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sign up to get started on LegalAssist
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-2 p-1 border border-slate-200 dark:border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'citizen' })}
                  className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    formData.role === 'citizen'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <UserIcon className="w-4 h-4" /> Citizen
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'advocate' })}
                  className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    formData.role === 'advocate'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Briefcase className="w-4 h-4" /> Advocate
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="e.g. johndoe"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="e.g. john@example.com"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Min 6 characters"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Re-enter password"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}

        <div className="text-center pt-2 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
