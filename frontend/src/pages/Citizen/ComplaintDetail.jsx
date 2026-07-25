import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { ToastContext } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { 
  ArrowLeft, Download, Send, MessageSquare, ShieldAlert, FileText, 
  HelpCircle, ChevronDown, ChevronUp, CheckSquare, Square, CheckCircle, Clock, Copy, X, Video
} from 'lucide-react';
import DeLegaleseText from '../../components/DeLegaleseText';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { showToast } = useContext(ToastContext);
  const { user } = useContext(AuthContext);

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ai_guide'); // ai_guide, chat, advocate_replies
  const [evidenceChecked, setEvidenceChecked] = useState({});
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [advocateRating, setAdvocateRating] = useState(5);
  const [reviewTextContent, setReviewTextContent] = useState('');
  const [advocateReviewsMap, setAdvocateReviewsMap] = useState({});

  // Payment gateway simulation states
  const [activePaymentReply, setActivePaymentReply] = useState(null); // { replyId, fee }
  const [paymentStep, setPaymentStep] = useState(0); // 0: Form, 1: Connecting, 2: OTP, 3: Processing, 4: Success
  const [otpCode, setOtpCode] = useState('');
  const [cardFormData, setCardFormData] = useState({ name: '', number: '', expiry: '', cvv: '' });

  // Chat States
  const [chatMessage, setChatMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef(null);

  // Translation States
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [translatedReport, setTranslatedReport] = useState(null);
  const [translating, setTranslating] = useState(false);

  const handleLanguageToggle = async (lang) => {
    if (lang === 'en') {
      setActiveLanguage('en');
      return;
    }

    if (translatedReport) {
      setActiveLanguage('ml');
      return;
    }

    setTranslating(true);
    try {
      const res = await api.post(`/complaints/${id}/translate`, {
        targetLanguage: 'Malayalam'
      });
      if (res.data.success && res.data.translated) {
        setTranslatedReport(res.data.translated);
        setActiveLanguage('ml');
        showToast('Legal Report translated to Malayalam.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to translate report.', 'error');
    } finally {
      setTranslating(false);
    }
  };

  const fetchAdvocateRating = async (advocateId) => {
    try {
      const res = await api.get(`/advocates/${advocateId}/reviews`);
      if (res.data.success) {
        setAdvocateReviewsMap(prev => ({
          ...prev,
          [advocateId]: {
            averageRating: res.data.averageRating,
            reviews: res.data.reviews
          }
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (complaint?.advocateReplies?.length > 0) {
      complaint.advocateReplies.forEach(reply => {
        if (reply.advocate?._id) {
          fetchAdvocateRating(reply.advocate._id);
        }
      });
    }
  }, [complaint]);

  const handleOpenNoticeModal = () => {
    if (!complaint) return;
    
    const formattedDate = new Date(complaint.createdAt).toLocaleDateString();
    const lawsText = complaint.aiResponse?.applicableLaws?.map(l => `- ${l.law}`).join('\n') || '';
    
    const text = `FORMAL LEGAL NOTICE OF GRIEVANCE

Date: ${formattedDate}

From:
Citizen Filer: ${complaint.citizen?.username || 'Grievant'}
Location: ${complaint.district}, ${complaint.state}
Contact Email: ${complaint.citizen?.email || 'N/A'}

To:
Respondent (Name of Business / Individual in Dispute)

Subject: Notice of Legal Grievance and Demand for Redress

Dear Sir/Madam,

This is a formal communication notifying you of a legal grievance regarding the incident that occurred on or about ${new Date(complaint.incidentDate).toLocaleDateString()}. 

Particulars of Grievance:
"${complaint.description}"

Please note that this matter has been evaluated and may involve violations under the following statutory frameworks:
Classification: ${complaint.aiResponse?.classification || 'General Dispute'}
Statutes and Codes:
${lawsText}

We hereby demand that you contact the undersigned within fifteen (15) business days of receiving this notice to resolve this dispute amicably. Failure to do so may compel the filing of a formal complaint with the suggested authority: ${complaint.aiResponse?.suggestedAuthority || 'the appropriate court or tribunal'}.

This communication is sent without prejudice to any other rights or remedies available under law.

Sincerely,
_______________________________
${complaint.citizen?.username || 'Grievant'}
`;
    setNoticeText(text);
    setShowNoticeModal(true);
  };

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(noticeText);
    showToast('Legal notice copied to clipboard!', 'success');
  };

  const handleDownloadNotice = () => {
    const blob = new Blob([noticeText], { type: 'text/plain;charset=utf-8' });
    const fileURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileURL;
    link.setAttribute('download', `LegalAssist_Notice_${complaint._id}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Legal notice draft downloaded.', 'success');
  };

  // FAQ accordion state
  const [faqOpen, setFaqOpen] = useState({});
  const [advocateSlots, setAdvocateSlots] = useState({});

  useEffect(() => {
    if (complaint && complaint.advocateReplies) {
      complaint.advocateReplies.forEach(reply => {
        const advId = reply.advocate?._id || reply.advocate;
        if (advId) {
          api.get(`/advocates/${advId}/availability`)
            .then(res => {
              if (res.data.success) {
                setAdvocateSlots(prev => ({
                  ...prev,
                  [advId]: res.data.slots
                }));
              }
            })
            .catch(err => console.error('Failed to fetch slots for advocate:', advId, err));
        }
      });
    }
  }, [complaint?.advocateReplies]);

  const fetchComplaintDetails = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
      }
    } catch (err) {
      showToast('Failed to load complaint details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  // Handle auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [complaint?.followUpChat, activeTab]);

  // Load checked evidence from local storage
  useEffect(() => {
    if (complaint) {
      const savedChecked = localStorage.getItem(`evidence_${complaint._id}`);
      if (savedChecked) {
        setEvidenceChecked(JSON.parse(savedChecked));
      }
    }
  }, [complaint]);

  const toggleEvidence = (docName) => {
    const updated = { ...evidenceChecked, [docName]: !evidenceChecked[docName] };
    setEvidenceChecked(updated);
    localStorage.setItem(`evidence_${complaint._id}`, JSON.stringify(updated));
  };

  const handleDownloadPdf = async () => {
    try {
      showToast('Generating legal report PDF...', 'info');
      
      const res = await api.get(`/complaints/${id}/pdf`, { responseType: 'blob' });
      
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      
      // Create temporary link and click it to download
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `LegalAssist_Report_${complaint._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('PDF exported successfully!', 'success');
    } catch (err) {
      showToast('Failed to export PDF report.', 'error');
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    setSendingChat(true);
    const msgToSend = chatMessage;
    setChatMessage('');

    try {
      const res = await api.post(`/complaints/${id}/chat`, { message: msgToSend });
      if (res.data.success) {
        setComplaint({ ...complaint, followUpChat: res.data.chat });
        showToast('Reply generated by AI assistant.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Chat message failed.', 'error');
    } finally {
      setSendingChat(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-500/25';
      case 'under_review': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-500/25';
      default: return 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-300 border-rose-500/25';
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
        <Link to="/citizen/dashboard" className="text-primary-500 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  const ai = activeLanguage === 'ml' && translatedReport ? translatedReport : complaint.aiResponse;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Navigation and Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link 
            to="/citizen/dashboard" 
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-darkCard text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs text-slate-450 font-semibold block">Citizen Case File</span>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">{complaint.title}</h1>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={handleOpenNoticeModal}
            className="flex-grow sm:flex-initial px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-500/5 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 text-xs"
            title="Generate Legal Notice Draft"
          >
            <FileText className="w-4 h-4 text-indigo-500" /> Draft Notice
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex-grow sm:flex-initial px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/10 transition-all flex items-center justify-center gap-1.5 text-xs"
          >
            <Download className="w-4 h-4" /> Export Report (PDF)
          </button>
        </div>
      </div>

      {/* Case Details Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-darkCard shadow-sm text-sm">
        <div>
          <span className="text-slate-400 font-bold text-xs uppercase block">Grievance Category</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">{complaint.category}</span>
        </div>
        <div>
          <span className="text-slate-400 font-bold text-xs uppercase block">Incident Date & Location</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
            {new Date(complaint.incidentDate).toLocaleDateString()} - {complaint.district}, {complaint.state}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-bold text-xs uppercase block">Status</span>
          <span className={`inline-block border px-2.5 py-0.5 rounded-full text-xs font-bold uppercase mt-1 ${getStatusColor(complaint.status)}`}>
            {complaint.status.replace('_', ' ')}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-bold text-xs uppercase block">Case Reference ID</span>
          <span className="font-mono text-xs text-slate-500 mt-1.5 block">{complaint._id}</span>
        </div>
      </div>

      {/* Warning Box */}
      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/25 rounded-2xl flex gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-semibold">
          Disclaimer: This platform provides informational guidance only and is not a substitute for professional legal advice or court decisions.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('ai_guide')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-4 ${
              activeTab === 'ai_guide'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            AI Guidance Report
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-4 flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            AI Chat Assistant
          </button>
          <button
            onClick={() => setActiveTab('advocate_replies')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-4 flex items-center gap-1.5 ${
              activeTab === 'advocate_replies'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            Advocate Advice ({complaint.advocateReplies?.length || 0})
          </button>
        </div>

        {activeTab === 'ai_guide' && (
          <div className="pb-3 flex items-center gap-2 text-xs">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Report Language:</span>
            <div className="flex p-0.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 text-[10px] font-bold shadow-sm">
              <button
                type="button"
                onClick={() => handleLanguageToggle('en')}
                disabled={translating}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeLanguage === 'en'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => handleLanguageToggle('ml')}
                disabled={translating}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeLanguage === 'ml'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {translating && (
                  <span className="w-2.5 h-2.5 border border-slate-400 border-t-transparent rounded-full animate-spin inline-block"></span>
                )}
                മലയാളം
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: GUIDES & HISTORY */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'ai_guide' && (
            <div className="space-y-6">
              
              {/* 1. Summary */}
              <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white border-l-4 border-primary-500 pl-3">
                  1. Executive Case Summary
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed font-medium">
                  <DeLegaleseText text={ai?.summary} />
                </p>
              </div>

              {/* 2. Classification & Authority */}
              <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-5">
                <h3 className="text-base font-bold text-slate-800 dark:text-white border-l-4 border-primary-500 pl-3">
                  2. Legal Classifications & Jurisdictions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl space-y-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">Legal Category</span>
                    <p className="font-semibold text-slate-850 dark:text-slate-200">{ai?.classification}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl space-y-1">
                    <span className="text-xs text-slate-400 font-bold uppercase">Suggested Authority Forum</span>
                    <p className="font-semibold text-slate-855 dark:text-slate-200">{ai?.suggestedAuthority}</p>
                  </div>
                </div>
              </div>

              {/* 3. Applicable Laws */}
              <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white border-l-4 border-primary-500 pl-3">
                  3. Potentially Applicable Laws (Informational Only)
                </h3>
                <div className="space-y-4">
                  {ai?.applicableLaws?.map((lawItem, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 space-y-1">
                      <h4 className="font-bold text-sm text-slate-850 dark:text-white">{lawItem.law}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed"><DeLegaleseText text={lawItem.description} /></p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Evidence Checklist */}
              <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white border-l-4 border-primary-500 pl-3">
                  4. Recommended Case Evidence Checklist
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Collect and cross off the items as you prepare them for your dossier.
                </p>
                <div className="space-y-3">
                  {ai?.requiredDocuments?.map((doc, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => toggleEvidence(doc)}
                      className="flex items-start gap-3 p-3.5 border border-slate-100 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 bg-slate-50/20 dark:bg-slate-950/10 rounded-xl cursor-pointer select-none transition-all"
                    >
                      {evidenceChecked[doc] ? (
                        <CheckSquare className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                      <span className={`text-xs ${evidenceChecked[doc] ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
                        {doc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Procedures Timeline */}
              <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-6">
                <h3 className="text-base font-bold text-slate-800 dark:text-white border-l-4 border-primary-500 pl-3">
                  5. Actionable Resolution Procedures
                </h3>
                <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-8">
                  {ai?.stepByStepProcedure?.map((step, idx) => (
                    <div key={idx} className="relative pl-8">
                      <div className="absolute -left-[13px] top-0.5 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-xs border border-primary-500/20">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Next Steps & Tips */}
              <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-5">
                <h3 className="text-base font-bold text-slate-800 dark:text-white border-l-4 border-primary-500 pl-3">
                  6. Next Actions & Safeguard Tips
                </h3>
                <div className="space-y-3 text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">Immediate Next Steps:</h4>
                  {ai?.nextActions?.map((act, idx) => (
                    <p key={idx} className="flex gap-2">
                      <span className="text-primary-500 font-black">•</span> {act}
                    </p>
                  ))}

                  <h4 className="font-bold text-slate-800 dark:text-white mt-4 mb-2">Preventive Safeguard Tips:</h4>
                  {ai?.preventiveTips?.map((tip, idx) => (
                    <p key={idx} className="flex gap-2">
                      <span className="text-indigo-500 font-black">-</span> {tip}
                    </p>
                  ))}
                </div>
              </div>

              {/* 7. FAQs */}
              <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white border-l-4 border-primary-500 pl-3">
                  7. Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {ai?.faqs?.map((faq, idx) => (
                    <div key={idx} className="border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 overflow-hidden text-xs">
                      <button
                        onClick={() => setFaqOpen({ ...faqOpen, [idx]: !faqOpen[idx] })}
                        className="w-full p-4 text-left font-bold text-slate-800 dark:text-white flex justify-between items-center"
                      >
                        <span>Q: {faq.question}</span>
                        {faqOpen[idx] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {faqOpen[idx] && (
                        <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 leading-relaxed bg-white dark:bg-darkCard">
                          A: {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl shadow-sm flex flex-col h-[650px] overflow-hidden">
              
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-darkCard/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">LegalAssist AI Assistant Online</span>
                </div>
              </div>

              {/* Chat Message Window */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Initial Welcome AI Message */}
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold flex-shrink-0 text-xs border border-primary-500/20">
                    AI
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl rounded-tl-none border border-slate-200/40 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1 shadow-sm leading-relaxed">
                    <p>Hello! I am your AI assistant. You can ask me follow-up questions regarding the laws, procedures, or document formats suggested in your Legal Guidance report.</p>
                  </div>
                </div>

                {complaint.followUpChat?.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`flex gap-3 max-w-[85%] ${chat.role === 'user' ? 'ml-auto justify-end' : ''}`}
                  >
                    {chat.role !== 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold flex-shrink-0 text-xs border border-primary-500/20">
                        AI
                      </div>
                    )}
                    
                    <div className={`p-3.5 rounded-2xl text-xs space-y-1 shadow-sm leading-relaxed whitespace-pre-wrap ${
                      chat.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-none'
                        : 'bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'
                    }`}>
                      <p><DeLegaleseText text={chat.message} /></p>
                    </div>

                    {chat.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-indigo-150 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 text-xs border border-indigo-500/20">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                ))}
                
                {sendingChat && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold flex-shrink-0 text-xs border border-primary-500/20">
                      AI
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 text-xs text-slate-500 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input Area */}
              <form onSubmit={handleSendChat} className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-darkCard/40 flex gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  disabled={sendingChat}
                  placeholder="Ask follow-up questions..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !chatMessage.trim()}
                  className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'advocate_replies' && (
            <div className="space-y-6">
              <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
                <h3 className="text-base font-bold text-slate-800 dark:text-white border-l-4 border-primary-500 pl-3 mb-4">
                  Official Advocate Feedbacks
                </h3>

                {complaint.advocateReplies?.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Clock className="w-8 h-8 text-slate-450 mx-auto" />
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      No advocate replies submitted yet. When a registered advocate reviews your case dossier, their official guidance replies will display here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 divide-y divide-slate-100 dark:divide-slate-800">
                    {complaint.advocateReplies.map((reply, idx) => (
                      <div key={reply._id || idx} className={`pt-6 ${idx === 0 ? 'pt-0' : ''} space-y-3`}>
                        <div className="flex items-center gap-3">
                          {reply.advocate?.profileImage ? (
                            <img
                              src={`http://localhost:5000${reply.advocate.profileImage}`}
                              alt="Advocate Avatar"
                              className="w-8 h-8 rounded-full border border-primary-500 object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-xs border border-primary-300 dark:border-primary-800">
                              {reply.advocate?.username?.[0].toUpperCase() || 'A'}
                            </div>
                          )}
                          <div className="flex-1 flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                Advocate {reply.advocate?.username || 'Counsel'}
                                {advocateReviewsMap[reply.advocate?._id] && (
                                  <span className="text-[10px] text-amber-500 flex items-center gap-0.5 font-bold">
                                    ★ {advocateReviewsMap[reply.advocate._id].averageRating} ({advocateReviewsMap[reply.advocate._id].reviews.length} reviews)
                                  </span>
                                )}
                              </h4>
                              <span className="text-[10px] text-slate-400 block font-medium">
                                {new Date(reply.replyDate).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {reply.paymentStatus === 'paid' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold px-3 py-1.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 select-none" title={`Receipt ID: ${reply.transactionId}`}>
                                  ✓ Paid (₹{reply.consultationFee || 500})
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActivePaymentReply({ replyId: reply._id, fee: reply.consultationFee || 500 });
                                    setPaymentStep(0);
                                    setCardFormData({ name: '', number: '', expiry: '', cvv: '' });
                                    setOtpCode('');
                                  }}
                                  className="text-[10px] text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center gap-1 cursor-pointer animate-pulse"
                                >
                                  💳 Pay Fee (₹{reply.consultationFee || 500})
                                </button>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAdvocate(reply.advocate);
                                  setAdvocateRating(5);
                                  setReviewTextContent('');
                                  setShowReviewModal(true);
                                }}
                                className="text-[10px] text-primary-500 hover:underline font-bold px-3 py-1.5 rounded-lg border border-primary-500/10 hover:bg-primary-500/5 transition-all"
                              >
                                Rate Advocate
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed p-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                          {reply.message}
                        </p>

                        {/* Slot booking interface */}
                        {(() => {
                          const slot = complaint.videoSlots?.find(
                            s => s.advocate === reply.advocate?._id || s.advocate?._id === reply.advocate?._id
                          );
                          const slotsForAdvocate = advocateSlots[reply.advocate?._id] || [];
                          return (
                            <div className="mt-3 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-xs">
                              {!slot ? (
                                <form onSubmit={async (e) => {
                                  e.preventDefault();
                                  const requestedTime = e.target.prefTime.value;
                                  if (!requestedTime) {
                                    showToast('Please select a valid availability slot.', 'error');
                                    return;
                                  }
                                  try {
                                    const res = await api.post(`/complaints/${complaint._id}/slots/request`, {
                                      advocateId: reply.advocate?._id,
                                      requestedTime
                                    });
                                    if (res.data.success) {
                                      showToast('Video consultation requested!', 'success');
                                      fetchComplaintDetails();
                                    }
                                  } catch (err) {
                                    showToast(err.response?.data?.message || 'Failed to request video slot.', 'error');
                                  }
                                }} className="flex flex-col sm:flex-row sm:items-end gap-3">
                                  <div className="flex-1 space-y-1">
                                    <label className="font-bold text-[9px] text-slate-450 uppercase block mb-1">Request Live Video Consultation</label>
                                    {slotsForAdvocate.length === 0 ? (
                                      <select
                                        name="prefTime"
                                        disabled
                                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-400 outline-none"
                                      >
                                        <option value="">No availability slots posted by this advocate</option>
                                      </select>
                                    ) : (
                                      <select
                                        name="prefTime"
                                        required
                                        className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500"
                                      >
                                        <option value="">-- Choose an Available Slot --</option>
                                        {slotsForAdvocate.map(s => (
                                          <option key={s._id} value={s.time}>
                                            {new Date(s.time).toLocaleString()}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={slotsForAdvocate.length === 0}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] shadow-sm shadow-indigo-500/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    Book Video Slot
                                  </button>
                                </form>
                              ) : (
                                <div className="flex justify-between items-center gap-4 flex-wrap">
                                  <div className="space-y-1">
                                    <span className="font-bold text-[9px] text-slate-450 uppercase block">Consultation Status</span>
                                    {slot.status === 'pending' && (
                                      <p className="text-slate-500 font-medium">Awaiting slot confirmation for preferred time: <span className="font-bold text-slate-750 dark:text-slate-250">{new Date(slot.requestedTime).toLocaleString()}</span></p>
                                    )}
                                    {slot.status === 'scheduled' && (
                                      <p className="text-slate-800 dark:text-slate-250 font-bold">
                                        Confirmed! Video call scheduled for: <span className="text-indigo-600 dark:text-indigo-400">{new Date(slot.scheduledTime).toLocaleString()}</span>
                                      </p>
                                    )}
                                    {slot.status === 'rejected' && (
                                      <p className="text-rose-500 font-medium">Declined by advocate. You can clear request and try booking another slot.</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {slot.status === 'scheduled' && (
                                      <a
                                        href={slot.meetingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-[10px] shadow-sm shadow-indigo-500/10 transition-all animate-pulse flex items-center gap-1"
                                      >
                                        <Video className="w-3.5 h-3.5" /> Join Live Call
                                      </a>
                                    )}
                                    {(slot.status === 'pending' || slot.status === 'rejected') && (
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (!window.confirm('Cancel this video call request?')) return;
                                          try {
                                            const res = await api.delete(`/complaints/${complaint._id}/slots/${slot._id}`);
                                            if (res.data.success) {
                                              showToast('Video slot request cleared.', 'success');
                                              fetchComplaintDetails();
                                            }
                                          } catch (err) {
                                            showToast('Failed to cancel slot request.', 'error');
                                          }
                                        }}
                                        className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
                                      >
                                        Cancel Request
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CASE FILE DATA & ATTACHMENTS */}
        <div className="space-y-6">
          
          {/* Case Description Card */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Lodged Case Grievance
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-350 leading-relaxed font-medium bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <h4 className="font-bold text-slate-800 dark:text-white mb-2">{complaint.title}</h4>
              <p className="whitespace-pre-line">{complaint.description}</p>
            </div>
          </div>

          {/* Case Attachments */}
          <div className="p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard rounded-3xl space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Supporting Dossier Attachments
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
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-150 dark:border-slate-800 hover:border-primary-500/20 bg-slate-50/50 dark:bg-slate-950/20 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all overflow-hidden"
                  >
                    <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="text-xs font-semibold truncate hover:underline">{doc.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Draft Legal Notice Modal Overlay */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 md:p-8 space-y-6 relative flex flex-col h-[80vh] max-h-[600px] shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold">Formal Legal Notice Draft</h3>
              <button 
                onClick={() => setShowNoticeModal(false)}
                className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-450">
              * Note: You may edit this draft directly before copying or downloading.
            </p>

            <div className="flex-1 overflow-y-auto">
              <textarea
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                rows="14"
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-[11px] leading-relaxed outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 resize-none text-slate-700 dark:text-slate-300 h-full"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={handleCopyNotice}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Copy className="w-4 h-4 text-primary-500" /> Copy to Clipboard
              </button>
              <button
                type="button"
                onClick={handleDownloadNotice}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-primary-500/10"
              >
                <Download className="w-4 h-4" /> Download Notice (.TXT)
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rate Advocate Modal Overlay */}
      {showReviewModal && selectedAdvocate && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-sm font-bold">Rate Advocate: {selectedAdvocate.username}</h3>
              <button 
                onClick={() => { setShowReviewModal(false); setSelectedAdvocate(null); }}
                className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await api.post(`/advocates/${selectedAdvocate._id}/reviews`, {
                  rating: advocateRating,
                  reviewText: reviewTextContent
                });
                if (res.data.success) {
                  showToast(res.data.message, 'success');
                  setShowReviewModal(false);
                  setReviewTextContent('');
                  fetchAdvocateRating(selectedAdvocate._id);
                }
              } catch (err) {
                showToast(err.response?.data?.message || 'Submission failed.', 'error');
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setAdvocateRating(star)}
                      className={`text-xl transition-all ${
                        star <= advocateRating ? 'text-amber-500 scale-110' : 'text-slate-350 dark:text-slate-700'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Your Review Message</label>
                <textarea
                  value={reviewTextContent}
                  onChange={(e) => setReviewTextContent(e.target.value)}
                  required
                  rows="4"
                  placeholder="Share your experience consulting with this advocate..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 resize-none text-slate-700 dark:text-slate-300"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Simulated Payment Gateway Modal */}
      {activePaymentReply && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 md:p-8 space-y-6 shadow-2xl relative text-slate-800 dark:text-slate-200">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                <h3 className="text-sm font-bold text-slate-850 dark:text-white">LegalAssist Payment Gateway</h3>
              </div>
              {paymentStep !== 1 && paymentStep !== 3 && (
                <button 
                  onClick={() => setActivePaymentReply(null)}
                  className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Step 0: Card Details Form */}
            {paymentStep === 0 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                setPaymentStep(1);
                // Simulate gateway connection loading
                setTimeout(() => {
                  setPaymentStep(2);
                }, 2000);
              }} className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Consultation Fee Amount</span>
                    <p className="text-lg font-black text-slate-800 dark:text-white">₹{activePaymentReply.fee}.00</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 font-bold text-[9px] uppercase border border-indigo-500/20 rounded-full">
                    Secure Payment
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block text-left">Cardholder Full Name</label>
                  <input
                    type="text"
                    required
                    value={cardFormData.name}
                    onChange={(e) => setCardFormData({ ...cardFormData, name: e.target.value })}
                    placeholder="E.g. Athul Krishna"
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 text-slate-700 dark:text-slate-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 uppercase block text-left">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength="19"
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={cardFormData.number}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\s?/g, '').replace(/[^0-9]/g, '');
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                      setCardFormData({ ...cardFormData, number: formatted });
                    }}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 text-slate-700 dark:text-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase block text-left">Expiry Date</label>
                    <input
                      type="text"
                      required
                      maxLength="5"
                      placeholder="MM/YY"
                      value={cardFormData.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 2) {
                          val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        }
                        setCardFormData({ ...cardFormData, expiry: val });
                      }}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 text-slate-700 dark:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-450 uppercase block text-left">CVV Code</label>
                    <input
                      type="password"
                      required
                      maxLength="3"
                      placeholder="•••"
                      value={cardFormData.cvv}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setCardFormData({ ...cardFormData, cvv: val });
                      }}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 text-slate-700 dark:text-slate-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer mt-4"
                >
                  Pay ₹{activePaymentReply.fee}.00
                </button>
              </form>
            )}

            {/* Step 1: Connecting Loading */}
            {paymentStep === 1 && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-850 dark:text-white">Connecting to secure gateway...</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400">Do not refresh or click back</p>
                </div>
              </div>
            )}

            {/* Step 2: OTP Entry */}
            {paymentStep === 2 && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (otpCode !== '1234') {
                  showToast('Invalid OTP code. Please use simulated code "1234".', 'error');
                  return;
                }
                setPaymentStep(3);
                try {
                  const res = await api.post(`/complaints/${complaint._id}/replies/${activePaymentReply.replyId}/pay`);
                  if (res.data.success) {
                    setPaymentStep(4);
                  }
                } catch (err) {
                  showToast('Payment processing failed.', 'error');
                  setPaymentStep(0);
                }
              }} className="space-y-4 text-xs text-center py-4">
                <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-sm mx-auto">
                  <p className="font-bold text-slate-850 dark:text-white text-xs">Verify Transaction OTP</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 leading-relaxed">
                    A mock 4-digit code has been sent to your bank phone. Enter **1234** to simulate verification.
                  </p>
                </div>
                <div className="max-w-xs mx-auto space-y-3 pt-2">
                  <input
                    type="text"
                    maxLength="4"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 4-digit OTP"
                    className="w-full text-center tracking-widest px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent outline-none focus:ring-2 focus:ring-primary-500/10 focus:border-primary-500 text-slate-700 dark:text-slate-350"
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Confirm Payment Authorization
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Processing API call */}
            {paymentStep === 3 && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-850 dark:text-white">Authorizing transaction with bank...</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400">Verifying security signatures</p>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {paymentStep === 4 && (
              <div className="flex flex-col items-center justify-center py-8 space-y-5 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20 animate-bounce">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-white">Payment Completed Successfully!</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400">Your advocate consultation is now unlocked.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActivePaymentReply(null);
                    fetchComplaintDetails();
                  }}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintDetail;
