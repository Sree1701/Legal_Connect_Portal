import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1329] transition-colors duration-200 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-6 h-6 text-primary-500" />
              <span className="text-lg font-bold text-slate-800 dark:text-white">LegalAssist</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Empowering citizens with rapid, accessible, and structured AI legal summaries and procedure guidance before taking cases forward.
            </p>
          </div>

          {/* Site Navigation */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">System Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">About Us</Link></li>
              <li><Link to="/services" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">Our Services</Link></li>
              <li><Link to="/faq" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">Common FAQs</Link></li>
              <li><Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400">Contact Team</Link></li>
            </ul>
          </div>

          {/* Legal guidelines & disclaimer notice */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Official Status</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This application is an educational, AI-powered informational guidance assistant. It does not issue official court decrees or provide certified legal representation.
            </p>
          </div>
        </div>

        {/* Global Warning Box */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 rounded-xl mb-8">
          <p className="text-xs text-amber-800 dark:text-amber-300 text-center font-medium leading-relaxed">
            "This platform provides informational guidance only and is not a substitute for professional legal advice or court decisions."
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-6 text-xs text-slate-400 dark:text-slate-500">
          <span>&copy; {new Date().getFullYear()} LegalAssist Inc. All rights reserved.</span>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span className="cursor-help hover:underline">Privacy Policy</span>
            <span>&bull;</span>
            <span className="cursor-help hover:underline">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
