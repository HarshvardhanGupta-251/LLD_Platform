import React from 'react';

interface NavbarProps {
  currentTab: 'problems' | 'history' | 'practice';
  onSelectTab: (tab: 'problems' | 'history') => void;
  activeProblemTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectTab }) => {
  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center pt-5 px-4">
      <nav className="w-full max-w-3xl flex items-center justify-between px-5 h-[52px] rounded-2xl bg-[#111118]/90 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40">
        {/* Logo */}
        <button
          onClick={() => onSelectTab('problems')}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          {/* Icon mark */}
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8 L8 3 L13 8 L8 13 Z" fill="#111118" />
              <circle cx="8" cy="8" r="2" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">ArchLab LLD</span>
        </button>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => onSelectTab('problems')}
            className="px-4 py-1.5 text-sm text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/5 font-medium"
          >
            Problems
          </button>
          <button
            onClick={() => onSelectTab('history')}
            className="px-4 py-1.5 text-sm text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/5 font-medium"
          >
            History
          </button>
          <span className="px-4 py-1.5 text-sm text-slate-500 font-medium cursor-default">
            About
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={() => onSelectTab('problems')}
          className="px-4 py-1.5 text-sm font-semibold text-[#111118] bg-white rounded-xl hover:bg-slate-100 transition-colors shadow-sm"
        >
          Get started
        </button>
      </nav>
    </div>
  );
};
