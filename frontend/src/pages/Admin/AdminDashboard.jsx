import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ToastContext } from '../../context/ToastContext';
import { 
  Users, FileText, Award, CheckCircle, MessageSquare, 
  Settings, Trash2, RefreshCw, Layers 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';

const AdminDashboard = () => {
  const { showToast } = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalComplaints: 0, activeAdvocates: 0, pendingComplaints: 0, resolvedComplaints: 0 });
  const [categoriesData, setCategoriesData] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [statesData, setStatesData] = useState([]);
  const [recentFeedbacks, setRecentFeedbacks] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setStats(res.data.stats);
        setCategoriesData(res.data.charts.categories || []);
        setTrendsData(res.data.charts.trends || []);
        setStatesData(res.data.charts.states || []);
        setRecentFeedbacks(res.data.recentFeedbacks || []);
      }
    } catch (err) {
      showToast('Error loading dashboard analytics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff7300', '#a4de6c'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 dark:bg-darkBg">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400 bg-primary-950/40 border border-primary-500/25 px-2.5 py-0.5 rounded-full inline-block">
            System Administrator Control
          </span>
          <h1 className="text-3xl font-extrabold">Executive Analytics Panel</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Monitor registration metrics, evaluate complaint trends, manage advocate credentials, and audit user feedbacks.
          </p>
        </div>
        
        {/* Navigation Sidebar Quick links */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Users className="w-3.5 h-3.5" /> User Manager
          </Link>
          <Link
            to="/admin/complaints"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5" /> Case Manager
          </Link>
          <Link
            to="/admin/feedback"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Feedback Audit
          </Link>
          <Link
            to="/admin/support"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Support Auditor
          </Link>
        </div>
      </div>

      {/* Core metrics cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Users</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total Complaints</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{stats.totalComplaints}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Active Advocates</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{stats.activeAdvocates}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Resolved Cases</p>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">{stats.resolvedComplaints}</h3>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Line Chart: Complaint trends (last 6 months) */}
        <div className="lg:col-span-2 p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Layers className="w-4.5 h-4.5 text-primary-500" /> Monthly Grievance Submissions
          </h3>
          <div className="h-72 w-full text-xs">
            {trendsData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">No trend data logged.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3b82f61a" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Complaints" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pie Chart: Categories distribution */}
        <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Category Distributions
          </h3>
          <div className="h-72 w-full text-xs flex flex-col justify-between">
            {categoriesData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-400">No categories data logged.</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="75%">
                  <PieChart>
                    <Pie
                      data={categoriesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Labels legend */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-450 mt-2 max-h-20 overflow-y-auto pr-1">
                  {categoriesData.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="truncate">{c.name}: {c.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Geographical State-wise Grievance distribution (Heatmap) */}
      <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
          <Layers className="w-4.5 h-4.5 text-primary-500" /> State-wise Grievance Distribution
        </h3>
        <p className="text-[10px] text-slate-405 font-medium leading-relaxed">
          Aggregated distribution of case filings across regions. Darker bars indicate areas with higher dispute counts (Heatmap).
        </p>
        <div className="h-64 w-full text-xs">
          {statesData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400">No regional data logged.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3b82f61a" />
                <XAxis dataKey="state" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} maxBarSize={55} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Feedbacks list */}
      <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4.5 h-4.5 text-primary-500" /> Recent User Feedbacks
        </h3>
        
        {recentFeedbacks.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No user feedbacks logged yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {recentFeedbacks.map((f) => (
              <div key={f._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{f.user?.username || 'User'}</span>
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-450">
                      {f.user?.role}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">{f.comments}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/10 px-2.5 py-1 rounded-lg text-amber-600 dark:text-amber-400 font-bold">
                    ★ {f.rating}/5
                  </div>
                  <span className="text-[10px] text-slate-400">{new Date(f.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
