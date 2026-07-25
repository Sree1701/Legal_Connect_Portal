import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { ToastContext } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft, Search, Edit, Trash2, ShieldAlert, RefreshCw } from 'lucide-react';

const UserManager = () => {
  const { showToast } = useContext(ToastContext);
  const { user: currentUser } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Edit Role Modal state
  const [editUser, setEditUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [updatingRole, setUpdatingRole] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: {
          search,
          role: roleFilter,
          page,
          limit: 10
        }
      });
      if (res.data.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.pagination.pages);
      }
    } catch (err) {
      showToast('Error loading user listing.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, page]);

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      showToast('Cannot delete your own administrator profile.', 'error');
      return;
    }

    if (!window.confirm('WARNING: Deleting this user will purge all associated case filings and feedbacks. Proceed?')) {
      return;
    }

    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        showToast('User profile and associated files deleted.', 'success');
        fetchUsers();
      }
    } catch (err) {
      showToast('User deletion failed.', 'error');
    }
  };

  const openEditModal = (user) => {
    setEditUser(user);
    setSelectedRole(user.role);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (editUser._id === currentUser.id && selectedRole !== 'admin') {
      showToast('You cannot remove admin rights from your own active session.', 'error');
      return;
    }

    setUpdatingRole(true);
    try {
      const res = await api.put(`/admin/users/${editUser._id}`, { role: selectedRole });
      if (res.data.success) {
        showToast(`User promoted to ${selectedRole}!`, 'success');
        setEditUser(null);
        fetchUsers();
      }
    } catch (err) {
      showToast('Failed to update user role.', 'error');
    } finally {
      setUpdatingRole(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-350 border-rose-500/20';
      case 'advocate': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-350 border-indigo-500/20';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-700/20';
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
          <h1 className="text-lg font-black text-slate-800 dark:text-white">Unified User Directory</h1>
        </div>
      </div>

      {/* Main user management directory */}
      <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
        
        {/* Controls Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500"
              />
            </div>
            
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard outline-none"
            >
              <option value="All">All Roles</option>
              <option value="citizen">Citizen</option>
              <option value="advocate">Advocate</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            <p className="text-sm text-slate-400">Loading user profiles...</p>
          </div>
        ) : users.length === 0 ? (
          <p className="text-xs text-slate-450 py-12 text-center">No user accounts found matching query filters.</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-500 uppercase font-bold">
                    <th className="py-4 px-4">Username</th>
                    <th className="py-4 px-4">Email</th>
                    <th className="py-4 px-4">Role</th>
                    <th className="py-4 px-4">Verification</th>
                    <th className="py-4 px-4">Date Registered</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-350">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <td className="py-4 px-4 flex items-center gap-2.5">
                        {u.profileImage ? (
                          <img
                            src={`http://localhost:5000${u.profileImage}`}
                            alt="Avatar"
                            className="w-7 h-7 rounded-full object-cover border border-slate-300"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border text-[10px] font-black uppercase text-slate-400">
                            {u.username[0]}
                          </div>
                        )}
                        <span>{u.username}</span>
                      </td>
                      <td className="py-4 px-4">{u.email}</td>
                      <td className="py-4 px-4">
                        <span className={`border px-2.5 py-0.5 rounded-full uppercase text-[9px] font-bold ${getRoleColor(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-semibold ${u.isEmailVerified ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {u.isEmailVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="py-4 px-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 border rounded-lg hover:border-primary-500 hover:bg-primary-500/5 text-slate-400 hover:text-primary-500 transition-all"
                          title="Modify Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="p-1.5 border rounded-lg hover:border-rose-500 hover:bg-rose-500/5 text-slate-400 hover:text-rose-500 transition-all"
                          title="Delete Profile"
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
                <span className="text-xs text-slate-405">Page {page} of {totalPages}</span>
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

      {/* Edit Role Overlay Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 space-y-5 relative">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Modify User Role</h3>
            <p className="text-xs text-slate-450">
              Change the access permissions for user: <strong className="text-slate-700 dark:text-slate-200">{editUser.username}</strong>
            </p>

            <form onSubmit={handleUpdateRole} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Role Type</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard text-xs outline-none"
                >
                  <option value="citizen">Citizen</option>
                  <option value="advocate">Advocate</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 text-xs border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingRole}
                  className="px-4 py-2 text-xs bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
