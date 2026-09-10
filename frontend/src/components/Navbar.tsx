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
          <img
            src="/logo.jpg"
            alt="LLD_Platform logo"
            className="w-7 h-7 rounded-lg object-cover"
          />
          <span className="text-sm font-semibold text-white tracking-tight">LLD_Platform</span>
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
          <a
            href="https://github.com/HarshvardhanGupta-251"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 text-sm text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/5 font-medium"
          >
            About
          </a>
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
