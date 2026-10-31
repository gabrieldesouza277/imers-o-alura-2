import React from 'react';
import { 
  Calculator, 
  Percent, 
  Ruler, 
  Dice5, 
  GitFork, 
  Shapes, 
  Box, 
  Terminal, 
  Sparkles, 
  History, 
  Volume2, 
  VolumeX, 
  Orbit 
} from 'lucide-react';
import { CalculatorTab } from '../types/math';
import { playClickSound } from '../utils/audio';

interface NavbarProps {
  activeTab: CalculatorTab;
  onTabChange: (tab: CalculatorTab) => void;
  onOpenAntigravity: () => void;
  historyCount: number;
  onOpenHistory: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenAntigravity,
  historyCount,
  onOpenHistory,
  isMuted,
  onToggleSound,
}) => {
  const tabs: { id: CalculatorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'scientific', label: 'Científica', icon: <Calculator className="w-4 h-4" /> },
    { id: 'percentage', label: 'Porcentagem', icon: <Percent className="w-4 h-4" /> },
    { id: 'scale', label: 'Escala', icon: <Ruler className="w-4 h-4" /> },
    { id: 'probability', label: 'Probabilidade', icon: <Dice5 className="w-4 h-4" /> },
    { id: 'rule_of_three', label: 'Regra de Três', icon: <GitFork className="w-4 h-4" /> },
    { id: 'plane_geometry', label: 'Geom. Plana', icon: <Shapes className="w-4 h-4" /> },
    { id: 'spatial_geometry', label: 'Geom. Espacial', icon: <Box className="w-4 h-4" /> },
    { id: 'python_studio', label: 'Python Studio', icon: <Terminal className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        {/* Top bar with branding and Antigravity button */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Orbit className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '14s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  PyMath Antigravity
                </span>
                <span className="text-[11px] font-mono text-emerald-400">
                  Python 3.12 Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Calculadora Matemática Científica & Simulação Física
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Antigravity Mode Button */}
            <button
              onClick={onOpenAntigravity}
              className="relative group overflow-hidden px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:scale-[1.02] active:scale-95 flex items-center gap-2"
              title="Ativar simulação física do Google Antigravity"
            >
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="hidden xs:inline">Modo Google Antigravity</span>
              <span className="xs:hidden">Antigravidade</span>
            </button>

            {/* Sound toggle */}
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 transition-colors"
              title={isMuted ? 'Ativar Sons' : 'Desativar Sons'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* History toggle */}
            <button
              onClick={onOpenHistory}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Ver histórico de cálculos"
            >
              <History className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Histórico</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-blue-600 text-white rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClickSound(480);
                  onTabChange(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
