import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ToastContext } from '../../context/ToastContext';
import { ArrowLeft, MessageSquare, Star, RefreshCw } from 'lucide-react';

const FeedbackManager = () => {
  const { showToast } = useContext(ToastContext);

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/feedback', {
        params: {
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setFeedbacks(res.data.feedbacks);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      showToast('Error loading feedback listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [page]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4.5 h-4.5 ${
            i <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200 dark:text-slate-750'
          }`}
        />
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
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
          <h1 className="text-lg font-black text-slate-800 dark:text-white">Citizen Feedback Audits</h1>
        </div>
      </div>

      {/* Main feedback dashboard */}
      <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
          <h2 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
            <MessageSquare className="w-4.5 h-4.5 text-primary-500" /> System-Wide User Feedbacks
          </h2>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading feedbacks...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <p className="text-xs text-slate-450 py-12 text-center">No citizen reviews or feedbacks submitted yet.</p>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {feedbacks.map((f) => (
                <div 
                  key={f._id} 
                  className="p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 space-y-3 flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <strong className="text-slate-800 dark:text-slate-200">{f.user?.username || 'User'}</strong>
                      <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 capitalize">
                        {f.user?.role || 'Guest'}
                      </span>
                    </div>
                    {renderStars(f.rating)}
                  </div>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed font-medium">
                    "{f.comments}"
                  </p>

                  <div className="text-[10px] text-slate-400 text-right pt-2 border-t border-slate-100 dark:border-slate-850">
                    Logged: {new Date(f.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
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

export default FeedbackManager;
