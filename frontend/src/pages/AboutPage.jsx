import React from 'react';
import { ShieldCheck, Scale, Award, Heart } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">Our Mission & Purpose</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Empowering citizens with legal transparency and clear action guides before taking matters to litigation.
        </p>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Why We Built LegalAssist</h2>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Ordinary citizens often face high barriers to understanding basic legal processes when disputes arise. Consulting legal counsel immediately can be intimidating, expensive, and time-consuming. 
          </p>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Our portal aims to fill this critical information gap. By parsing your query using state-of-the-art AI, we organize the complex statutes and procedures into structured checklists, helping you collect evidence, draft complaints, and locate local judicial authorities confidently.
          </p>
        </div>
        
        {/* Value badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard space-y-3">
            <Scale className="w-6 h-6 text-primary-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">Accessibility First</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Simplifying confusing legalese into clear terms.</p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard space-y-3">
            <ShieldCheck className="w-6 h-6 text-primary-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">Data Security</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your details are protected using robust encryptions.</p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard space-y-3">
            <Award className="w-6 h-6 text-primary-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">Verified Advocates</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">counsel responses are handled only by licensed users.</p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-darkCard space-y-3">
            <Heart className="w-6 h-6 text-primary-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">Citizen Advocacy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Dedicated entirely to citizen preparation and support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
