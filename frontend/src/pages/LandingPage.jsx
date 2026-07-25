import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Scale, BookOpen, ShieldCheck, ArrowRight, Sparkles, MessageSquare, Download } from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  const getStartedPath = () => {
    if (!isAuthenticated) return '/register';
    return user.role === 'admin' ? '/admin/dashboard' : user.role === 'advocate' ? '/advocate/dashboard' : '/citizen/submit';
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 lg:pt-32">
        {/* Decorative background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/10 dark:bg-primary-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-indigo-400/10 dark:bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-600 dark:text-primary-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" /> LegalAssist AI Engine
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none max-w-4xl mx-auto">
            Democratizing Legal Clarity for{' '}
            <span className="bg-gradient-to-r from-primary-500 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Every Citizen
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Understand your rights, legal classifications, suggested local authorities, and required evidence within minutes before consulting a lawyer.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              to={getStartedPath()}
              className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group transition-all"
            >
              Get AI Case Guidance
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-8 py-4 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-darkCard rounded-xl font-bold transition-all text-slate-700 dark:text-slate-200"
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Empowering Citizen Rights</h2>
          <p className="text-slate-500 dark:text-slate-400">
            A comprehensive set of features tailored to remove complexity and prepare you for subsequent legal interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard space-y-5 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-primary-100 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl w-fit">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Jurisdiction Classification</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We process case details and highlight which specific laws and categories (e.g. Consumer, Labor, Property) govern the issue.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard space-y-5 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Step-by-Step Procedures</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Find out what agency (Police, Consumer Commission, civil court) to contact, which documents to collect, and which path to follow.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard space-y-5 shadow-sm hover:shadow-md transition-all">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Advocate Guidance Hub</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Submit your preliminary reports directly for evaluation by verified advocates who can respond with secure guidance.
            </p>
          </div>
        </div>
      </section>

      {/* How it works layout (Timeline component) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-100/50 dark:bg-slate-900/10 rounded-3xl border border-slate-200/50 dark:border-slate-800/30">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">How LegalAssist Works</h2>
          <p className="text-slate-500 dark:text-slate-400">
            A linear progression designed to maximize clarity and minimize stress.
          </p>
        </div>

        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 md:ml-32 md:mr-32 space-y-12">
          {/* Step 1 */}
          <div className="relative pl-8 md:pl-12">
            <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-primary-600 text-white font-bold flex items-center justify-center shadow-lg shadow-primary-500/20 text-sm">
              1
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">File Incident Particulars</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Describe the legal issue or dispute (e.g. delayed wages, fraudulent product purchase, landlord eviction) and upload receipts or communications.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative pl-8 md:pl-12">
            <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shadow-lg shadow-indigo-500/20 text-sm">
              2
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">AI Legal Analysis Dispatch</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Our AI engine automatically aggregates the context, highlights the applicable acts or codes, suggests standard formats, and displays FAQs.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative pl-8 md:pl-12">
            <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shadow-lg shadow-emerald-500/20 text-sm">
              3
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Follow-Up or Export</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Download a comprehensive PDF report containing your legal outline, ask follow-up questions to our AI legal assistant, or await counsel replies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 border-t border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Designed For</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center opacity-65 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <div className="font-semibold text-slate-600 dark:text-slate-300 text-sm flex items-center justify-center gap-1">
            <Scale className="w-5 h-5" /> Consumer Disputes
          </div>
          <div className="font-semibold text-slate-600 dark:text-slate-300 text-sm flex items-center justify-center gap-1">
            <BookOpen className="w-5 h-5" /> Labor & Wages
          </div>
          <div className="font-semibold text-slate-600 dark:text-slate-300 text-sm flex items-center justify-center gap-1">
            <ShieldCheck className="w-5 h-5" /> Civil Disputes
          </div>
          <div className="font-semibold text-slate-600 dark:text-slate-300 text-sm flex items-center justify-center gap-1">
            <MessageSquare className="w-5 h-5" /> Digital Harassments
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
