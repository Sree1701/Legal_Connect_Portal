import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ToastContext } from '../../context/ToastContext';
import { ArrowLeft, Search, Trash2, Edit2, RefreshCw } from 'lucide-react';

const ComplaintManager = () => {
  const { showToast } = useContext(ToastContext);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit status modal state
  const [editCase, setEditCase] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchAllComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints', {
        params: {
          search,
          status: statusFilter,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setComplaints(res.data.complaints);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      showToast('Error loading complaints listings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
  }, [search, statusFilter, page]);

  const handleDeleteCase = async (id) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this case dossier? This action is irreversible.')) {
      return;
    }

    try {
      const res = await api.delete(`/admin/complaints/${id}`);
      if (res.data.success) {
        showToast('Complaint case dossier deleted successfully.', 'success');
        fetchAllComplaints();
      }
    } catch (err) {
      showToast('Deletion failed.', 'error');
    }
  };

  const openEditModal = (complaint) => {
    setEditCase(complaint);
    setSelectedStatus(complaint.status);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      const res = await api.put(`/admin/complaints/${editCase._id}`, { status: selectedStatus });
      if (res.data.success) {
        showToast(`Case status updated to ${selectedStatus}!`, 'success');
        setEditCase(null);
        fetchAllComplaints();
      }
    } catch (err) {
      showToast('Failed to update case status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-305 border-emerald-500/20';
      case 'under_review': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-305 border-amber-500/20';
      default: return 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-305 border-rose-500/20';
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
          <h1 className="text-lg font-black text-slate-800 dark:text-white">Citizen Cases Manager</h1>
        </div>
      </div>

      {/* Complaints main workspace */}
      <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        
        {/* Search controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search case title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Directory Grid Table */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading complaints dossiers...</p>
          </div>
        ) : complaints.length === 0 ? (
          <p className="text-xs text-slate-450 py-12 text-center">No complaints dossiers registered on the system.</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 uppercase font-bold">
                    <th className="py-4 px-4">Citizen filer</th>
                    <th className="py-4 px-4">Case Title</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Incident Date</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-350">
                  {complaints.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-4 px-4">{c.citizen?.username || 'Citizen'}</td>
                      <td className="py-4 px-4 max-w-xs truncate">{c.title}</td>
                      <td className="py-4 px-4">{c.category}</td>
                      <td className="py-4 px-4">{new Date(c.incidentDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4">
                        <span className={`border px-2.5 py-0.5 rounded-full uppercase text-[9px] font-bold ${getStatusBadge(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 border rounded-lg hover:border-primary-500 hover:bg-primary-500/5 text-slate-400 hover:text-primary-500 transition-all"
                          title="Modify Status"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCase(c._id)}
                          className="p-1.5 border rounded-lg hover:border-rose-500 hover:bg-rose-500/5 text-slate-400 hover:text-rose-500 transition-all"
                          title="Delete Dossier"
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

      {/* Edit Status Modal Overlay */}
      {editCase && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-5 relative">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Modify Case Status</h3>
            <p className="text-xs text-slate-450">
              Update status for case dossier: <strong className="text-slate-700 dark:text-slate-200">{editCase.title}</strong>
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Case Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard text-xs outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditCase(null)}
                  className="px-4 py-2 text-xs border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-4 py-2 text-xs bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManager;
