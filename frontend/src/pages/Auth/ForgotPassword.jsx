import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ToastContext } from '../../context/ToastContext';
import { ShieldCheck, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { showToast } = useContext(ToastContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setSuccess(true);
        showToast('Reset link has been dispatched.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Password reset request failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-darkBg transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 p-8 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-darkCard shadow-xl animate-fade-in">
        {/* Branding header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Recover Password</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        {success ? (
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl text-center space-y-4 animate-fade-in">
            <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
              We have sent a reset password link to your email.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              If running in local development mode, look inside the file system for recovery details at: <br/>
              <code className="bg-slate-100 dark:bg-slate-900 p-1 rounded font-mono break-all text-[10px]">
                backend/logs/emails/
              </code>
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. john@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
