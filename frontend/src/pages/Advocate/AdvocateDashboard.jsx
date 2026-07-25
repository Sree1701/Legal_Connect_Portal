import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { ToastContext } from '../../context/ToastContext';
import { 
  Scale, Briefcase, FileText, CheckCircle2, Clock, 
  Search, RefreshCw, Plus, Trash2 
} from 'lucide-react';

const AdvocateDashboard = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all (pending/under_review), my_responses
  const [search, setSearch] = useState('');
  
  const [stats, setStats] = useState({ totalActive: 0, myReplied: 0, pendingReview: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Availability Manager States
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [addingSlot, setAddingSlot] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(true);

  const fetchAdvocateCases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/advocate/complaints', {
        params: {
          filter: filterType,
          search,
          page,
          limit: 8
        }
      });
      if (res.data.success) {
        setComplaints(res.data.complaints);
        setTotalPages(res.data.pagination.pages);
      }

      // Calculate stats
      const activeRes = await api.get('/advocate/complaints', { params: { filter: 'all', limit: 1000 } });
      const myRes = await api.get('/advocate/complaints', { params: { filter: 'my_responses', limit: 1000 } });
      
      if (activeRes.data.success && myRes.data.success) {
        setStats({
          totalActive: activeRes.data.pagination.total,
          myReplied: myRes.data.pagination.total,
          pendingReview: activeRes.data.complaints.filter(c => c.status === 'pending').length
        });
      }

    } catch (err) {
      showToast('Error loading consultation requests.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    setFetchingSlots(true);
    try {
      const res = await api.get('/advocate/availability');
      if (res.data.success) {
        setAvailabilitySlots(res.data.slots);
      }
    } catch (err) {
      showToast('Failed to load availability slots.', 'error');
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlotTime) return;

    setAddingSlot(true);
    try {
      const res = await api.post('/advocate/availability', { time: newSlotTime });
      if (res.data.success) {
        setAvailabilitySlots(res.data.slots);
        setNewSlotTime('');
        showToast('Availability slot added successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add slot.', 'error');
    } finally {
      setAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to remove this availability slot?')) return;

    try {
      const res = await api.delete(`/advocate/availability/${slotId}`);
      if (res.data.success) {
        setAvailabilitySlots(res.data.slots);
        showToast('Availability slot removed.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove slot.', 'error');
    }
  };

  useEffect(() => {
    fetchAdvocateCases();
  }, [filterType, search, page]);

  useEffect(() => {
    fetchAvailability();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-105 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-500/20';
      case 'under_review': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 border-amber-500/20';
      default: return 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-300 border-rose-500/20';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-primary-950 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-500/10 border border-primary-500/25 rounded-full text-xs font-bold text-primary-400">
            <Scale className="w-3.5 h-3.5" /> Licensed Advocate Panelist
          </div>
          <h1 className="text-3xl font-extrabold">Advocate Panel workspace</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Review citizen case dossiers, evaluate AI-generated legal reports, and respond with secure official guidance.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-bold block">LOGGED IN AS</span>
          <span className="text-sm font-extrabold text-primary-400">{user?.username}</span>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Available Active Cases</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.totalActive}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Awaiting Preliminary Review</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.pendingReview}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Cases Responded By Me</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">{stats.myReplied}</h3>
          </div>
        </div>
      </div>

      {/* Split Layout: Case Directory & Availability Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Case Directory (Left) */}
        <div className="lg:col-span-2 bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
            {/* Tab Filter */}
            <div className="flex gap-2 p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 w-full md:w-auto">
              <button
                onClick={() => { setFilterType('all'); setPage(1); }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  filterType === 'all'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                }`}
              >
                Open Consultations
              </button>
              <button
                onClick={() => { setFilterType('my_responses'); setPage(1); }}
                className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  filterType === 'my_responses'
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                }`}
              >
                My Responses
              </button>
            </div>

            {/* Search bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search case dossiers by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Case List */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20 gap-3">
              <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
              <p className="text-sm text-slate-400">Loading case dossiers...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-400 text-sm">No consultation requests matching query filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 uppercase font-bold">
                      <th className="py-4 px-4">Citizen Name</th>
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
                        <td className="py-4 px-4">
                          <span className="bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-4 px-4">{new Date(c.incidentDate).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <span className={`border px-2.5 py-0.5 rounded-full uppercase text-[10px] font-bold ${getStatusBadge(c.status)}`}>
                            {c.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            to={`/advocate/complaint/${c._id}`}
                            className="px-4 py-2 border border-primary-500/20 hover:border-primary-500 bg-primary-500/5 hover:bg-primary-600 text-primary-600 hover:text-white dark:text-primary-400 rounded-xl transition-all font-bold inline-block"
                          >
                            Review Case
                          </Link>
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

        {/* Availability Manager (Right) */}
        <div className="lg:col-span-1 bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 self-start shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <h2 className="text-lg font-black text-slate-800 dark:text-white">Availability Slots</h2>
            <p className="text-xs text-slate-450 mt-1">Set open slots for citizens to book video calls.</p>
          </div>

          <form onSubmit={handleAddSlot} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider block">Add Availability Slot</label>
              <input
                type="datetime-local"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500"
              />
            </div>
            <button
              type="submit"
              disabled={addingSlot}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-xs shadow-md shadow-primary-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {addingSlot ? 'Adding...' : 'Post Open Slot'}
            </button>
          </form>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-455 uppercase tracking-wider">Scheduled availability</h3>
            {fetchingSlots ? (
              <p className="text-xs text-slate-400 font-semibold leading-relaxed animate-pulse">Fetching availability slots...</p>
            ) : availabilitySlots.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-855">
                No availability slots posted. Create one above.
              </p>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-1">
                {availabilitySlots.map((slot) => (
                  <div key={slot._id} className="flex justify-between items-center p-3.5 rounded-2xl border border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-900/15 text-xs">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-250">{new Date(slot.time).toLocaleString()}</p>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold mt-1.5 uppercase ${
                        slot.isBooked 
                          ? 'text-emerald-600 dark:text-emerald-450' 
                          : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${slot.isBooked ? 'bg-emerald-500' : 'bg-slate-350'}`}></span>
                        {slot.isBooked ? 'Booked' : 'Available'}
                      </span>
                    </div>
                    {!slot.isBooked && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot._id)}
                        className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                        title="Remove slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default AdvocateDashboard;
