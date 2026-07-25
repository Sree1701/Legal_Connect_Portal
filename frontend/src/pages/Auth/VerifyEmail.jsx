import React, { useEffect, useState, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../services/api';
import { ToastContext } from '../../context/ToastContext';
import { ShieldCheck, Loader, CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail = () => {
  const { showToast } = useContext(ToastContext);
  const location = useLocation();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the url link.');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        if (res.data.success) {
          setStatus('success');
          setMessage(res.data.message);
          showToast('Email verified successfully!', 'success');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification link is invalid or has expired.');
        showToast('Email verification failed.', 'error');
      }
    };

    verifyToken();
  }, [location, showToast]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-darkBg transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 p-8 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-darkCard shadow-xl text-center animate-fade-in">
        <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Email Verification</h2>

        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          {status === 'loading' && (
            <>
              <Loader className="w-12 h-12 text-primary-500 animate-spin" />
              <p className="text-sm text-slate-500">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-emerald-500" />
              <p className="text-sm text-emerald-600 font-medium">{message}</p>
              <Link
                to="/login"
                className="mt-4 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary-500/10"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-rose-500" />
              <p className="text-sm text-rose-600 font-medium">{message}</p>
              <Link
                to="/register"
                className="mt-4 px-6 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-darkCard text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all"
              >
                Sign Up Again
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
