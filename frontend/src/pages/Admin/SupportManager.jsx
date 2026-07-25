import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ToastContext } from '../../context/ToastContext';
import { ArrowLeft, Search, Trash2, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

const SupportManager = () => {
  const { showToast } = useContext(ToastContext);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/support', {
        params: {
          search,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setTickets(res.data.tickets);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      showToast('Error loading support inquiries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, page]);

  const handleToggleResolve = async (id) => {
    try {
      const res = await api.put(`/support/${id}/resolve`);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        fetchTickets();
      }
    } catch (err) {
      showToast('Failed to update resolve state.', 'error');
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this support inquiry?')) {
      return;
    }

    try {
      const res = await api.delete(`/support/${id}`);
      if (res.data.success) {
        showToast('Support inquiry deleted successfully.', 'success');
        fetchTickets();
      }
    } catch (err) {
      showToast('Deletion failed.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-fade-in">
      
      {/* Header Navigator */}
      <div className="flex items-center gap-3">
        <Link 
          to="/admin/dashboard" 
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-darkCard text-slate-500 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-xs text-slate-450 font-bold block">Administrator Workspace</span>
          <h1 className="text-lg font-black text-slate-800 dark:text-white">Support Queries Auditing</h1>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        
        {/* Search Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
          <h2 className="text-sm font-bold">Contact Form Submissions</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sender name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Table/List Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading support inquiries...</p>
          </div>
        ) : tickets.length === 0 ? (
          <p className="text-xs text-slate-450 py-12 text-center">No contact queries logged on the system.</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 uppercase font-bold">
                    <th className="py-4 px-4">Sender</th>
                    <th className="py-4 px-4">Subject</th>
                    <th className="py-4 px-4">Message</th>
                    <th className="py-4 px-4">Date Filed</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-350">
                  {tickets.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-4 px-4">
                        <span className="block font-bold">{t.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{t.email}</span>
                      </td>
                      <td className="py-4 px-4 font-bold">{t.subject}</td>
                      <td className="py-4 px-4 max-w-xs truncate" title={t.message}>{t.message}</td>
                      <td className="py-4 px-4">{new Date(t.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block border px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          t.isResolved 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-350 border-emerald-500/20' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-355 border-amber-500/20'
                        }`}>
                          {t.isResolved ? 'Resolved' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => handleToggleResolve(t._id)}
                          className={`p-1.5 border rounded-lg transition-all ${
                            t.isResolved 
                              ? 'hover:border-amber-500 hover:bg-amber-500/5 text-slate-400 hover:text-amber-500' 
                              : 'hover:border-emerald-500 hover:bg-emerald-500/5 text-slate-400 hover:text-emerald-500'
                          }`}
                          title={t.isResolved ? 'Mark as Pending' : 'Mark as Resolved'}
                        >
                          {t.isResolved ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(t._id)}
                          className="p-1.5 border rounded-lg hover:border-rose-500 hover:bg-rose-500/5 text-slate-400 hover:text-rose-500 transition-all"
                          title="Delete Query"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-950/20 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-450">Page {page} of {totalPages}</span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-950/20 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportManager;
