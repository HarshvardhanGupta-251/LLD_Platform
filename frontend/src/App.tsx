import React, { useState } from 'react';
import { Problem, Attempt } from './types';
import { Navbar } from './components/Navbar';
import { ProblemsPage } from './pages/ProblemsPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import PixelSnow from './components/PixelSnow';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'problems' | 'history' | 'practice'>('problems');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setCurrentTab('practice');
  };

  const handleSelectTab = (tab: 'problems' | 'history') => {
    setCurrentTab(tab);
    if (tab === 'problems') {
      setSelectedProblem(null);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans relative overflow-x-hidden" style={{ backgroundColor: '#0d0d14' }}>
      {/* React Bits PixelSnow WebGL Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <PixelSnow
          color="#ffffffff"
          flakeSize={0.005}
          minFlakeSize={1.25}
          pixelResolution={300}
          speed={.5}
          depthFade={9}
          farPlane={20}
          brightness={1.1}
          gamma={0.4545}
          density={0.5}
          variant="circle"
          direction={125}
        />
      </div>

      {/* Navbar — self-positions as fixed overlay */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        activeProblemTitle={selectedProblem?.title}
      />

      {/* Main Content Layer */}
      <div className="relative z-10 flex-1 flex flex-col">
        <main className="flex-1 pt-24">
          {currentTab === 'problems' && (
            <ProblemsPage onSelectProblem={handleSelectProblem} />
          )}

          {currentTab === 'practice' && selectedProblem && (
            <ProblemDetailPage
              problem={selectedProblem}
              onBack={() => handleSelectTab('problems')}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage onSelectAttempt={() => { }} />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.05] bg-black/30 backdrop-blur-md py-5 relative z-10">
          <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-slate-500">
            {/* Left: branding */}
            <span className="text-slate-400 font-semibold tracking-tight">
              Harshvardhan Gupta &mdash; LLD Practice Platform
            </span>

            {/* Right: contact links */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://github.com/HarshvardhanGupta-251/LLD_Platform"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors"
              >
                {/* GitHub icon */}
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub Repo
              </a>

              <a
                href="tel:+917037500363"
                className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
                +91 7037500363
              </a>

              <a
                href="mailto:harshvardhangupta751@gmail.com"
                className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                harshvardhangupta751@gmail.com
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
