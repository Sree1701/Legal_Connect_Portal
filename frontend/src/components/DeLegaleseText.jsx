import React from 'react';

// De-Legalese Dictionary mapping complex legal terms to simple explanations
const dictionary = {
  affidavit: "A written statement confirmed by oath, used as evidence in court.",
  arbitration: "A dispute resolution process where an independent party makes a binding decision outside of court.",
  injunction: "A court order that forces or stops a specific action.",
  jurisdiction: "The official power of a court or agency to make legal decisions over a case.",
  breach: "Breaking or failing to fulfill a contract or legal duty.",
  litigation: "The process of taking a dispute to a court of law.",
  statute: "A formal written law enacted by a legislative body.",
  defendant: "The party being sued or accused in a court of law.",
  plaintiff: "The party filing a lawsuit against someone else.",
  liability: "Legal responsibility for actions, debts, or damages.",
  mediation: "A voluntary settlement process guided by a neutral third party.",
  tribunal: "A special court set up to judge specific disputes (e.g. consumer disputes)."
};

const DeLegaleseText = ({ text }) => {
  if (!text) return null;

  // Compile dictionary keys as whole word boundaries (case-insensitive)
  const keys = Object.keys(dictionary).join('|');
  const regex = new RegExp(`\\b(${keys})\\b`, 'gi');

  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        if (dictionary[lowerPart]) {
          return (
            <span 
              key={index} 
              className="relative group inline-block cursor-help font-semibold text-primary-600 dark:text-primary-400 border-b border-dotted border-primary-500/70"
            >
              {part}
              {/* Sleek Tooltip card */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-slate-100 text-[10px] leading-relaxed shadow-xl border border-slate-750 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 text-center font-normal">
                {dictionary[lowerPart]}
                {/* Tooltip arrow */}
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-800"></span>
              </span>
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

export default DeLegaleseText;
