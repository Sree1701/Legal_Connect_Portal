import React, { useState, useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import api from '../services/api';

const ContactPage = () => {
  const { showToast } = useContext(ToastContext);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/support', formData);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit query.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Get in Touch</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Have questions about the platform, feedback, or need system support? Contact our desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Info Column */}
        <div className="space-y-8 bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 p-8 rounded-2xl">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Contact Information</h3>
          
          <div className="flex items-start gap-4">
            <Mail className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Email Support</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">support@legalassist.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Grievance Helpline</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">+1 (800) 555-0199</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Office Headquarters</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">100 Legal Way, Suite 400, New York, NY 10001</p>
            </div>
          </div>

          <div className="flex items-start gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <HelpCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Self Service</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check our detailed FAQ guide for instant solutions.</p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-2 bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="e.g. john@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g. System Access Issue"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Write your detailed query here..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Message'}
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
