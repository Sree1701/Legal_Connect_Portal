import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ToastContext } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { 
  ArrowLeft, FileText, Send, Calendar, MapPin, 
  User, CheckCircle, Scale, ShieldAlert, BookOpen, Clock, XCircle, CheckCircle2
} from 'lucide-react';
import DeLegaleseText from '../../components/DeLegaleseText';

const AdvocateComplaintDetail = () => {
  const { id } = useParams();
  const { showToast } = useContext(ToastContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Submit Response state
  const [replyMessage, setReplyMessage] = useState('');
  const [caseStatus, setCaseStatus] = useState('under_review');
  const [includeVideoCall, setIncludeVideoCall] = useState(false);
  const [consultationFee, setConsultationFee] = useState(500);
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
        setCaseStatus(res.data.complaint.status);
      }
    } catch (err) {
      showToast('Failed to load complaint dossier.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      showToast('Please type a guidance message.', 'error');
      return;
    }

    setSubmittingReply(true);
    try {
      const res = await api.post(`/advocate/complaints/${id}/reply`, {
        message: replyMessage,
        status: caseStatus,
        includeVideoCall,
        consultationFee
      });
      if (res.data.success) {
        showToast('Guidance reply logged and citizen notified!', 'success');
        setReplyMessage('');
        setIncludeVideoCall(false);
        setConsultationFee(500);
        fetchComplaintDetails();
      }
    } catch (err) {
      showToast('Failed to submit advice response.', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border-emerald-500/20';
      case 'under_review': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 border-amber-500/20';
      default: return 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-300 border-rose-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 dark:bg-darkBg">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h3 className="text-xl font-bold">Complaint Case Not Found</h3>
        <Link to="/advocate/dashboard" className="text-primary-500 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const ai = complaint.aiResponse;
  const advocateSlots = complaint.videoSlots?.filter(
    s => s.advocate === user?._id || s.advocate?._id === user?._id
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header Back Controls */}
      <div className="flex items-center gap-3">
        <Link 
          to="/advocate/dashboard" 
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-darkCard text-slate-500 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <span className="text-xs text-slate-450 font-bold block">Review Case Dossier</span>
          <h1 className="text-lg font-black text-slate-800 dark:text-white line-clamp-1">{complaint.title}</h1>
        </div>
      </div>

      {/* Case Header Details Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-darkCard shadow-sm text-sm">
        <div className="flex items-start gap-2.5">
          <User className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <span className="text-slate-450 text-[10px] uppercase font-bold block">Citizen filer</span>
            <span className="font-semibold">{complaint.citizen?.username} ({complaint.citizen?.email})</span>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <span className="text-slate-450 text-[10px] uppercase font-bold block">Incident Date</span>
            <span className="font-semibold">{new Date(complaint.incidentDate).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <span className="text-slate-450 text-[10px] uppercase font-bold block">Location</span>
            <span className="font-semibold">{complaint.district}, {complaint.state}</span>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <CheckCircle className="w-5 h-5 text-slate-400 mt-0.5" />
          <div>
            <span className="text-slate-450 text-[10px] uppercase font-bold block">Current Status</span>
            <span className={`inline-block border px-2.5 py-0.5 rounded-full uppercase text-[10px] font-bold mt-1 ${getStatusBadge(complaint.status)}`}>
              {complaint.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Split Layout Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: CITIZEN CASE DETAILS & WORKSPACE FORM */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Case statement details */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white border-l-4 border-primary-500 pl-3">
              Citizen Grievance Description
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl whitespace-pre-wrap">
              {complaint.description}
            </p>
          </div>

          {/* AI Guidance reference details */}
          {ai && (
            <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white border-l-4 border-indigo-500 pl-3">
                AI Guidance Reference (Generated via LegalAssist AI)
              </h3>
              
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                  <span className="font-bold text-slate-450 uppercase block text-[10px]">AI Case Summary:</span>
                  <p className="text-slate-500 dark:text-slate-300 leading-relaxed"><DeLegaleseText text={ai.summary} /></p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <span className="font-bold text-slate-450 uppercase block text-[10px] mb-1">AI Classification:</span>
                    <p className="font-semibold">{ai.classification}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <span className="font-bold text-slate-450 uppercase block text-[10px] mb-1">Suggested forum:</span>
                    <p className="font-semibold">{ai.suggestedAuthority}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2">
                  <span className="font-bold text-slate-450 uppercase block text-[10px]">Laws aggregated:</span>
                  <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                    {ai.applicableLaws?.map((law, idx) => (
                      <div key={idx} className="pt-2 first:pt-0">
                        <p className="font-bold">{law.law}</p>
                        <p className="text-slate-400 leading-relaxed mt-0.5"><DeLegaleseText text={law.description} /></p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Video Consultation Slots Section */}
          {ai && (
            <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-6">
              <h3 className="text-sm font-bold text-slate-850 dark:text-white border-l-4 border-indigo-500 pl-3">
                Live Video Consultation Requests
              </h3>

              {advocateSlots.length === 0 ? (
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">No active video call requests from this citizen.</p>
              ) : (
                <div className="space-y-4">
                  {advocateSlots.map((slot) => {
                    const isPending = slot.status === 'pending';
                    return (
                      <div key={slot._id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-855 bg-slate-50/50 dark:bg-slate-950/10 space-y-4 text-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-[10px] text-slate-400 uppercase block mb-1">Requested Time:</span>
                            <p className="font-bold text-slate-700 dark:text-slate-250">{new Date(slot.requestedTime).toLocaleString()}</p>
                          </div>
                          <div>
                            <span className={`inline-block border px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              slot.status === 'scheduled' 
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-350 border-emerald-500/20 animate-pulse' 
                                : slot.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-350 border-rose-500/20'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-350 border-amber-500/20'
                            }`}>
                              {slot.status === 'scheduled' ? 'Scheduled' : slot.status === 'rejected' ? 'Declined' : 'Pending Approval'}
                            </span>
                          </div>
                        </div>

                        {slot.status === 'scheduled' && (
                          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-250/20 font-semibold">
                            <span className="font-bold text-[9px] uppercase text-emerald-600 block mb-0.5">Confirmed Meeting Time:</span>
                            <p className="text-slate-700 dark:text-slate-200">{new Date(slot.scheduledTime).toLocaleString()}</p>
                            <a 
                              href={slot.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-450 hover:underline font-bold mt-2"
                            >
                              ★ Enter Conference Room Link
                            </a>
                          </div>
                        )}

                        {isPending && (
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            const targetTime = e.target.schedTime.value || slot.requestedTime;
                            try {
                              const res = await api.put(`/complaints/${complaint._id}/slots/${slot._id}/schedule`, {
                                scheduledTime: targetTime,
                                status: 'scheduled'
                              });
                              if (res.data.success) {
                                showToast('Video call scheduled successfully!', 'success');
                                fetchComplaintDetails();
                              }
                            } catch (err) {
                              showToast('Failed to schedule video slot.', 'error');
                            }
                          }} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                            <div className="space-y-1">
                              <label className="font-bold text-[10px] text-slate-500 uppercase block">Confirm/Reschedule Meeting Time *</label>
                              <input 
                                type="datetime-local" 
                                name="schedTime"
                                defaultValue={new Date(slot.requestedTime).toISOString().slice(0, 16)}
                                required
                                className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500"
                              />
                            </div>
                            <div className="flex gap-2 pt-1">
                              <button
                                type="submit"
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all text-[10px] shadow-sm shadow-emerald-500/10"
                              >
                                Approve Call
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!window.confirm('Decline this video consultation request?')) return;
                                  try {
                                    const res = await api.put(`/complaints/${complaint._id}/slots/${slot._id}/schedule`, {
                                      status: 'rejected'
                                    });
                                    if (res.data.success) {
                                      showToast('Video call request declined.', 'success');
                                      fetchComplaintDetails();
                                    }
                                  } catch (err) {
                                    showToast('Failed to decline slot request.', 'error');
                                  }
                                }}
                                className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-rose-500/5 text-rose-500 rounded-lg font-bold transition-all text-[10px]"
                              >
                                Decline Request
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submit Advocate response Advice form */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-6">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white border-l-4 border-emerald-500 pl-3">
              Official Advocate Consultation Reply
            </h3>

            <form onSubmit={handleSubmitReply} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Consultation Case Status</label>
                  <select
                    value={caseStatus}
                    onChange={(e) => setCaseStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard text-xs outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500"
                  >
                    <option value="under_review">Under Review</option>
                    <option value="resolved">Resolved / Consultation Finished</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Advice & Guidance Message</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  required
                  rows="6"
                  placeholder="Provide details on procedural recommendations, notify about template documents, draft notices, or offer next step consulting offline..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-150 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 max-w-sm">
                <input
                  type="checkbox"
                  id="includeVideoCall"
                  checked={includeVideoCall}
                  onChange={(e) => setIncludeVideoCall(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
                />
                <label htmlFor="includeVideoCall" className="text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer select-none">
                  Schedule Live WebRTC Video Call Room
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                <button
                  type="submit"
                  disabled={submittingReply || !replyMessage.trim()}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" /> Send Advice Response
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: ATTACHMENTS & RESPONSE HISTORY */}
        <div className="space-y-6">
          
          {/* Filer Attachments */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Citizen Evidential Attachments
            </h3>

            {complaint.documents?.length === 0 ? (
              <p className="text-xs text-slate-400">No documents uploaded for this case dossier.</p>
            ) : (
              <div className="space-y-2">
                {complaint.documents.map((doc, idx) => (
                  <a
                    key={idx}
                    href={`http://localhost:5000${doc.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-150 dark:border-slate-800 hover:border-primary-500/20 bg-slate-50/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all overflow-hidden"
                  >
                    <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="text-xs font-semibold truncate hover:underline">{doc.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Citizen AI Chat history (for reference) */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-slate-400" /> Citizen & AI Assistant History
            </h3>
            
            {complaint.followUpChat?.length === 0 ? (
              <p className="text-xs text-slate-400">No AI follow-up chat initiated by the citizen yet.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-3 pr-2 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {complaint.followUpChat.map((chat, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 space-y-1">
                    <span className="font-bold text-[10px] text-slate-400 uppercase block">
                      {chat.role === 'user' ? complaint.citizen?.username : 'LegalAssist AI Assistant'}
                    </span>
                    <p className="text-slate-500 dark:text-slate-350 italic">
                      "{chat.message.substring(0, 150)}{chat.message.length > 150 ? '...' : ''}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Response History */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Dossier Reply Logs ({complaint.advocateReplies?.length || 0})
            </h3>
            
            {complaint.advocateReplies?.length === 0 ? (
              <p className="text-xs text-slate-400">No consultation replies logged on this file yet.</p>
            ) : (
              <div className="space-y-4 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                {complaint.advocateReplies.map((rep, idx) => (
                  <div key={idx} className={`space-y-1 ${idx > 0 ? 'pt-3' : ''}`}>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-bold">Advocate: {rep.advocate?.username}</span>
                      <span>{new Date(rep.replyDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-300 leading-relaxed italic">
                      "{rep.message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdvocateComplaintDetail;
