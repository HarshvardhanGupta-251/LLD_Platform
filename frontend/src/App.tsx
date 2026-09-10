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
          color="#8888aa"
          flakeSize={0.01}
          minFlakeSize={1.25}
          pixelResolution={200}
          speed={1.0}
          depthFade={8}
          farPlane={20}
          brightness={1.1}
          gamma={0.4545}
          density={0.35}
          variant="square"
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
        <footer className="border-t border-slate-900/80 bg-slate-950/80 backdrop-blur-md py-6 text-center text-xs text-slate-500 font-mono relative z-10">
          LLD Practice Platform &bull; Node.js + TypeScript + Express + Prisma + React + Tailwind + React Bits CardNav + PixelSnow &bull; Polymorphic AI Evaluator
        </footer>
      </div>
    </div>
  );
};

export default App;
