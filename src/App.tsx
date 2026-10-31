import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ScientificCalc } from './components/ScientificCalc';
import { PercentageModule } from './components/PercentageModule';
import { ScaleModule } from './components/ScaleModule';
import { ProbabilityModule } from './components/ProbabilityModule';
import { RuleOfThreeModule } from './components/RuleOfThreeModule';
import { PlaneGeometryModule } from './components/PlaneGeometryModule';
import { SpatialGeometryModule } from './components/SpatialGeometryModule';
import { PythonStudio } from './components/PythonStudio';
import { AntigravityMode } from './components/AntigravityMode';
import { HistoryDrawer } from './components/HistoryDrawer';
import { CalculatorTab, CalculationHistoryItem } from './types/math';
import { getAudioMuted, setAudioMuted } from './utils/audio';
import { Sparkles, Terminal, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('scientific');
  const [isAntigravityActive, setIsAntigravityActive] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(getAudioMuted());
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('pymath_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pymath_history', JSON.stringify(history));
    } catch {
      // Ignore localStorage quotas
    }
  }, [history]);

  const handleAddToHistory = (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => {
    const newItem: CalculationHistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 49)]); // keep latest 50
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('pymath_history');
    } catch {
      // Ignore
    }
  };

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAudioMuted(next);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Google Antigravity Overlay Mode */}
      {isAntigravityActive && (
        <AntigravityMode
          onClose={() => setIsAntigravityActive(false)}
          activeFormulaCode={history[0]?.pythonCode}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />

      {/* Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenAntigravity={() => setIsAntigravityActive(true)}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Quick Antigravity Showcase Notice */}
        <div className="bg-gradient-to-r from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-indigo-800/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-300">
              <Sparkles className="w-5 h-5 animate-pulse text-yellow-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Google Antigravity & Motor Python Integrados
              </h2>
              <p className="text-xs text-slate-400">
                Explore regras de três simples e compostas, probabilidades e distribuições, escalas com conversão, geometrias 2D/3D interativas e experimente a física com zero gravidade.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAntigravityActive(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Experimentar Antigravidade</span>
          </button>
        </div>

        {/* Tab Modules View */}
        {activeTab === 'scientific' && (
          <ScientificCalc
            onAddToHistory={handleAddToHistory}
            onOpenAntigravity={() => setIsAntigravityActive(true)}
          />
        )}

        {activeTab === 'percentage' && (
          <PercentageModule onAddToHistory={handleAddToHistory} />
        )}

        {activeTab === 'scale' && (
          <ScaleModule onAddToHistory={handleAddToHistory} />
        )}

        {activeTab === 'probability' && (
          <ProbabilityModule onAddToHistory={handleAddToHistory} />
        )}

        {activeTab === 'rule_of_three' && (
          <RuleOfThreeModule onAddToHistory={handleAddToHistory} />
        )}

        {activeTab === 'plane_geometry' && (
          <PlaneGeometryModule onAddToHistory={handleAddToHistory} />
        )}

        {activeTab === 'spatial_geometry' && (
          <SpatialGeometryModule onAddToHistory={handleAddToHistory} />
        )}

        {activeTab === 'python_studio' && (
          <PythonStudio />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/70 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">PyMath Antigravity</span>
            <span>·</span>
            <span>Porcentagem, Escala, Probabilidade, Regra de Três, Geometria Plana e Espacial</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>Python 3.12 Standard Library</span>
            <span>·</span>
            <span>Matter.js Physics</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
