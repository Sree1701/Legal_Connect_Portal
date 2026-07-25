import React from 'react';
import { Sparkles, FileText, ClipboardList, Send, ShieldAlert, Award } from 'lucide-react';

const ServicesPage = () => {
  const services = [
    {
      icon: <Sparkles className="w-8 h-8 text-primary-500" />,
      title: "AI Legal Summaries",
      desc: "Instant, conversational parsing of submitted disputes into structured legal summaries, identifying potential code infractions."
    },
    {
      icon: <ClipboardList className="w-8 h-8 text-primary-500" />,
      title: "Document checklists",
      desc: "Auto-generated listings of receipts, correspondence copies, affidavits, and identities required by judicial panels."
    },
    {
      icon: <FileText className="w-8 h-8 text-primary-500" />,
      title: "Exportable PDF Reports",
      desc: "Download complete AI case briefs containing procedures and laws as elegant, printable PDF files for offline reference."
    },
    {
      icon: <Send className="w-8 h-8 text-primary-500" />,
      title: "Authority Suggestion",
      desc: "Locate where to direct your case—whether to local police desks, cybercrime desks, labor arbitration, or consumer tribunals."
    },
    {
      icon: <Award className="w-8 h-8 text-primary-500" />,
      title: "Advocate Consultations",
      desc: "Bridge the gap to live advice. Share your compiled AI brief with registered advocate panels who can respond directly."
    },
    {
      icon: <ShieldAlert className="w-8 h-8 text-primary-500" />,
      title: "Interactive AI Chat assistant",
      desc: "Ask follow-up questions to understand legal terms, notice drafts, and alternative conflict resolution paths."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">Our Core Services</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Features designed to clear confusion and lay out a direct pathway to resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((s, idx) => (
          <div key={idx} className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard space-y-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="mb-4">{s.icon}</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{s.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
