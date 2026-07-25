import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { 
  FileText, Clock, CheckCircle2, Search, ArrowUpDown, Plus, 
  Settings, User as UserIcon, Camera, RefreshCw 
} from 'lucide-react';

const CitizenDashboard = () => {
  const { user, token, updateProfileState } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Profile Edit state
  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [profileFile, setProfileFile] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints', {
        params: {
          search,
          category,
          status,
          sort,
          page,
          limit: 6
        }
      });
      if (res.data.success) {
        setComplaints(res.data.complaints);
        setTotalPages(res.data.pagination.pages);
        
        // Calculate statistics based on fetched results or custom query.
        // For simplicity, let's fetch stats from all user complaints.
        const allRes = await api.get('/complaints', { params: { limit: 1000 } });
        if (allRes.data.success) {
          const list = allRes.data.complaints;
          setStats({
            total: list.length,
            pending: list.filter(c => c.status === 'pending' || c.status === 'under_review').length,
            resolved: list.filter(c => c.status === 'resolved').length
          });
        }
      }
    } catch (err) {
      showToast('Error loading cases.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [search, category, status, sort, page]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    
    const formData = new FormData();
    formData.append('username', username);
    if (profileFile) {
      formData.append('profileImage', profileFile);
    }

    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        updateProfileState(res.data.user);
        showToast('Profile updated successfully!', 'success');
        setShowSettings(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Profile update failed.', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-500/20';
      case 'under_review': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-500/20';
      default: return 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border-rose-500/20';
    }
  };

  const categories = ['All', 'Consumer Dispute', 'Labour and Employment', 'Civil Property', 'Cyber Crime', 'Criminal Harassment', 'Family and Matrimonial', 'General'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary-900 to-indigo-900 text-white p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold">Welcome back, {user?.username}</h1>
          <p className="text-sm text-slate-350 max-w-xl text-slate-300">
            Lodge grievances, generate instant AI legal outlines, and check guidance statuses from advocates.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center gap-2 border border-white/15 transition-all text-sm"
          >
            <Settings className="w-4 h-4" /> Profile Edit
          </button>
          <Link
            to="/citizen/submit"
            className="p-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary-500/10 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Submit Complaint
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Complaints</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.total}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Under Review / Pending</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.pending}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Resolved Cases</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.resolved}</h3>
          </div>
        </div>
      </div>

      {/* Profile Settings Modal Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-8 space-y-6 relative">
            <h3 className="text-xl font-bold">Edit Profile Settings</h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              {/* Profile image select */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group cursor-pointer">
                  {profileFile ? (
                    <img 
                      src={URL.createObjectURL(profileFile)} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary-500"
                    />
                  ) : user?.profileImage ? (
                    <img 
                      src={`http://localhost:5000${user.profileImage}`} 
                      alt="Avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-slate-300 dark:border-slate-700">
                      <UserIcon className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                  <label className="absolute inset-0 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setProfileFile(e.target.files[0])} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <span className="text-xs text-slate-400">Click circle to upload profile photo</span>
              </div>

              {/* Username input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="px-5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-darkCard"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingProfile}
                  className="px-5 py-2.5 rounded-xl text-sm bg-primary-600 hover:bg-primary-700 text-white font-semibold flex items-center gap-1.5"
                >
                  {updatingProfile ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main complaint history space */}
      <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold">Your Complaint Grievances</h2>
          
          {/* Query Filter panel */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search case title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-56 pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Complaints List grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading cases...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <p className="text-slate-400 text-sm">No complaints found matching your query filter.</p>
            <Link
              to="/citizen/submit"
              className="inline-flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline"
            >
              Submit your first grievance <Plus className="w-4.5 h-4.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaints.map((c) => (
                <div 
                  key={c._id} 
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 hover:border-primary-500/30 dark:hover:border-primary-500/20 hover:shadow-sm transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[10px] font-extrabold uppercase border px-2.5 py-0.5 rounded-full ${getStatusColor(c.status)}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-850 dark:text-white line-clamp-1">{c.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/40 pt-4">
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                      {c.category}
                    </span>
                    <Link
                      to={`/citizen/complaint/${c._id}`}
                      className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline"
                    >
                      View Report & Chat &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-950/20 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
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

export default CitizenDashboard;
