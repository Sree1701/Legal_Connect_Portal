import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { ToastContext } from '../../context/ToastContext';
import { ShieldCheck, ArrowLeft, Upload, FileText, Trash2, Cpu, Mic } from 'lucide-react';

const SubmitComplaint = () => {
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [category, setCategory] = useState('General');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser. Please use Chrome, Edge or Safari.', 'warning');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      showToast('Speech recognition active. Speak now...', 'info');
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsListening(false);
      showToast('Error recording voice input.', 'error');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription((prev) => prev ? prev + ' ' + transcript : transcript);
      showToast('Speech added to description!', 'success');
    };

    recognition.start();
  };

  // States for visual feedback during AI loading
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingMessages = [
    "Uploading case documents and creating dossier...",
    "Connecting with LegalAssist AI analysis engine...",
    "Classifying legal jurisdiction and researching statutory frameworks...",
    "Drafting step-by-step resolution procedures and document requirements...",
    "Compiling FAQ guides and wrapping final report..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prevStep) => (prevStep + 1) % loadingMessages.length);
      }, 3500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Check limit
    if (files.length + selectedFiles.length > 5) {
      showToast('You can upload a maximum of 5 files.', 'warning');
      return;
    }

    // Validate size and extensions
    const validFiles = [];
    const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.doc', '.docx'];
    
    selectedFiles.forEach(file => {
      const sizeMB = file.size / (1024 * 1024);
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (sizeMB > 5) {
        showToast(`File "${file.name}" exceeds 5MB size limit.`, 'error');
      } else if (!allowed.includes(ext)) {
        showToast(`File "${file.name}" has invalid format.`, 'error');
      } else {
        validFiles.push(file);
      }
    });

    setFiles([...files, ...validFiles]);
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !incidentDate || !state || !district) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('incidentDate', incidentDate);
    formData.append('state', state);
    formData.append('district', district);
    formData.append('category', category);
    
    files.forEach(file => {
      formData.append('documents', file);
    });

    try {
      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        showToast('Complaint logged and analysed by AI successfully!', 'success');
        navigate(`/citizen/complaint/${res.data.complaint._id}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit complaint.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const states = [
    "California", "Texas", "Florida", "New York", "Illinois", 
    "Andhra Pradesh", "Delhi", "Karnataka", "Maharashtra", "Tamil Nadu", "Other"
  ];

  const categories = [
    "Consumer Dispute", "Labour and Employment", "Civil Property", 
    "Cyber Crime", "Criminal Harassment", "Family and Matrimonial", "General"
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6 relative">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/70 dark:bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 p-10 max-w-lg w-full text-center space-y-6 shadow-2xl">
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center bg-primary-100 dark:bg-primary-950/20 text-primary-500 rounded-full animate-bounce">
              <Cpu className="w-8 h-8 animate-pulse text-primary-600 dark:text-primary-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Case Analyzer Operating</h3>
              <p className="text-sm text-slate-400 font-medium h-10 flex items-center justify-center transition-all duration-300">
                {loadingMessages[loadingStep]}
              </p>
            </div>

            {/* Simulated bar loader */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${(loadingStep + 1) * 20}%` }}
              ></div>
            </div>
            
            <p className="text-[10px] text-slate-500">
              Disclaimer: LegalAssist AI outline operates as preliminary guidance and is not professional legal advice.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <div className="flex items-center gap-3">
        <Link 
          to="/citizen/dashboard" 
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-darkCard text-slate-500 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Back to Dashboard</span>
      </div>

      <div className="bg-white dark:bg-darkCard border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-sm">
        <div className="border-b border-slate-100 dark:border-slate-800/60 pb-5">
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">File A Legal Grievance</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 mt-1">
            Provide details of the dispute or legal grievance. Our AI engine will parse the issues and map remedies.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Title */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Complaint Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Failure to refund transactional deposit / Employer withholding wages"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Grievance Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Incident Date *</label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">State *</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">Select State</option>
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">District *</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
                placeholder="e.g. Brooklyn / Los Angeles / Central Delhi"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Incident Description *</label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows="6"
                  placeholder="Detail the timeline, transaction details, specific claims, dates, and names of individuals/businesses involved..."
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none animate-fade-in"
                ></textarea>
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`absolute right-3 bottom-4 p-2.5 rounded-xl border transition-all ${
                    isListening
                      ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse border-rose-650'
                      : 'border-slate-200 dark:border-slate-800 hover:border-primary-500 bg-white/50 dark:bg-darkCard/50 text-slate-405 hover:text-primary-500'
                  }`}
                  title="Voice dictation (Speech to Text)"
                >
                  <Mic className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Document Upload Area */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Supporting Evidences / Documents</label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:bg-slate-50/50 dark:hover:bg-slate-950/20 cursor-pointer relative transition-all">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <span className="block text-sm font-semibold text-slate-700 dark:text-slate-350">
                  Drag and drop files here, or click to upload
                </span>
                <span className="block text-xs text-slate-400 mt-1">
                  Supported formats: PDF, PNG, JPG, JPEG, GIF, DOC, DOCX (Max 5MB each, Limit: 5 files)
                </span>
              </div>
              
              {/* File list preview */}
              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-darkBg">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-5 h-5 text-primary-500 flex-shrink-0" />
                        <span className="text-xs font-medium truncate text-slate-800 dark:text-slate-300">{file.name}</span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <Link
              to="/citizen/dashboard"
              className="px-6 py-3 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:bg-slate-100 dark:hover:bg-darkCard transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-md shadow-primary-500/10 transition-all flex items-center gap-2"
            >
              Submit & Run AI Analysis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;
