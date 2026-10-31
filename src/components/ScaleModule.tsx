import React, { useState } from 'react';
import { 
  Ruler, 
  MapPin, 
  Maximize2, 
  Copy, 
  Check, 
  Play, 
  Coins, 
  HelpCircle, 
  Layers 
} from 'lucide-react';
import { calculateScale, UNIT_LABELS } from '../utils/mathFormulas';
import { executePythonCode } from '../utils/pythonEngine';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { CalculationHistoryItem, UnitLength } from '../types/math';

interface ScaleModuleProps {
  onAddToHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const ScaleModule: React.FC<ScaleModuleProps> = ({ onAddToHistory }) => {
  const [mode, setMode] = useState<'find_real' | 'find_paper' | 'find_scale'>('find_real');

  const [paperVal, setPaperVal] = useState<number>(5);
  const [paperUnit, setPaperUnit] = useState<UnitLength>('cm');

  const [realVal, setRealVal] = useState<number>(25);
  const [realUnit, setRealUnit] = useState<UnitLength>('m');

  const [scaleDenom, setScaleDenom] = useState<number>(500);

  const [copied, setCopied] = useState<boolean>(false);
  const [pyOutput, setPyOutput] = useState<string | null>(null);

  const result = (() => {
    try {
      return calculateScale(mode, paperVal, paperUnit, realVal, realUnit, scaleDenom);
    } catch (e: unknown) {
      return {
        scaleRatio: scaleDenom,
        paperDistance: paperVal,
        paperUnit,
        realDistance: realVal,
        realUnit,
        scaleString: `1:${scaleDenom}`,
        areaScaleString: '-',
        volumeScaleString: '-',
        steps: [e instanceof Error ? e.message : 'Erro no cálculo'],
        pythonCode: '# Erro nos parâmetros informados',
      };
    }
  })();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    playClickSound(650);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunPython = (code: string) => {
    playClickSound(700);
    const res = executePythonCode(code);
    if (res.success) {
      playSuccessSound();
      setPyOutput(res.output);
    } else {
      setPyOutput(res.error || 'Erro na execução');
    }
  };

  const handleSaveToHistory = () => {
    playSuccessSound();
    let title = '';
    let expr = '';

    if (mode === 'find_real') {
      title = `Escala 1:${scaleDenom}: ${paperVal} ${paperUnit} → Real`;
      expr = `D = ${paperVal} ${paperUnit} × ${scaleDenom}`;
    } else if (mode === 'find_paper') {
      title = `Escala 1:${scaleDenom}: ${realVal} ${realUnit} → Desenho`;
      expr = `d = (${realVal} ${realUnit}) / ${scaleDenom}`;
    } else {
      title = `Cálculo de Escala: ${paperVal} ${paperUnit} para ${realVal} ${realUnit}`;
      expr = `E = 1 : (${realVal} / ${paperVal})`;
    }

    onAddToHistory({
      category: 'Escala e Conversão',
      title,
      expression: expr,
      result: `${result.scaleString} | ${result.realDistance.toLocaleString()} ${result.realUnit}`,
      steps: result.steps,
      pythonCode: result.pythonCode,
    });
  };

  const presetScales = [
    { label: '1:50 (Arquitetura)', val: 50 },
    { label: '1:100 (Plantas)', val: 100 },
    { label: '1:500 (Topografia)', val: 500 },
    { label: '1:1.000 (Loteamentos)', val: 1000 },
    { label: '1:25.000 (Cartografia)', val: 25000 },
    { label: '1:100.000 (Mapas)', val: 100000 },
  ];

  return (
    <div className="space-y-6">
      {/* Mode navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
        <button
          onClick={() => { setMode('find_real'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'find_real'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Encontrar Medida Real (D)
        </button>
        <button
          onClick={() => { setMode('find_paper'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'find_paper'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Encontrar Medida no Desenho (d)
        </button>
        <button
          onClick={() => { setMode('find_scale'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'find_scale'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Determinar a Escala (1:N)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Configuração da Escala</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">E = d / D</span>
          </div>

          {/* Mode 1 & 2: Scale selector */}
          {mode !== 'find_scale' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Escala (1 : N)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-slate-400 bg-slate-950 px-3 py-2.5 rounded-xl border border-slate-800">
                  1 :
                </span>
                <input
                  type="number"
                  min="1"
                  value={scaleDenom}
                  onChange={(e) => setScaleDenom(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Presets */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {presetScales.map((p) => (
                  <button
                    key={p.val}
                    onClick={() => setScaleDenom(p.val)}
                    className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paper measurement */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {mode === 'find_paper' ? 'Unidade Desejada no Desenho (d)' : 'Medida no Desenho / Mapa (d)'}
            </label>
            <div className="flex items-center gap-3">
              {mode !== 'find_paper' ? (
                <input
                  type="number"
                  step="any"
                  value={paperVal}
                  onChange={(e) => setPaperVal(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-blue-400 font-mono text-sm">
                  {result.paperDistance.toFixed(4)} (Calculado)
                </div>
              )}
              <select
                value={paperUnit}
                onChange={(e) => setPaperUnit(e.target.value as UnitLength)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
              >
                <option value="mm">mm</option>
                <option value="cm">cm</option>
                <option value="m">m</option>
              </select>
            </div>
          </div>

          {/* Real measurement */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {mode === 'find_real' ? 'Unidade Desejada no Real (D)' : 'Medida no Mundo Real (D)'}
            </label>
            <div className="flex items-center gap-3">
              {mode !== 'find_real' ? (
                <input
                  type="number"
                  step="any"
                  value={realVal}
                  onChange={(e) => setRealVal(parseFloat(e.target.value) || 0)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-blue-400 font-mono text-sm">
                  {result.realDistance.toLocaleString(undefined, { maximumFractionDigits: 4 })} (Calculado)
                </div>
              )}
              <select
                value={realUnit}
                onChange={(e) => setRealUnit(e.target.value as UnitLength)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
              >
                <option value="m">metros (m)</option>
                <option value="km">quilômetros (km)</option>
                <option value="cm">centímetros (cm)</option>
                <option value="mm">milímetros (mm)</option>
              </select>
            </div>
          </div>

          {/* Visual scale ruler preview */}
          <div className="pt-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-2">
              Visualização de Escala Gráfica Comparativa:
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-blue-400">
                <span>Desenho: {result.paperDistance} {result.paperUnit}</span>
                <span>Real: {result.realDistance.toLocaleString()} {result.realUnit}</span>
              </div>
              <div className="h-4 bg-slate-900 rounded-md border border-slate-700 relative overflow-hidden flex">
                <div className="w-1/4 h-full bg-blue-600 flex items-center justify-center text-[9px] font-mono font-bold text-white">
                  0
                </div>
                <div className="w-1/4 h-full bg-slate-800 border-l border-slate-700" />
                <div className="w-1/4 h-full bg-blue-600 border-l border-slate-700" />
                <div className="w-1/4 h-full bg-slate-800 border-l border-slate-700" />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleSaveToHistory}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Salvar no Histórico</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">
              Fórmula Linear & Espacial
            </span>
          </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main Scale Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 font-mono block mb-1">
                Escala Linear (1:N)
              </span>
              <div className="text-xl font-bold font-mono text-blue-400">
                {result.scaleString}
              </div>
              <span className="text-[10px] text-slate-500">Dimensões 1D</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 font-mono block mb-1">
                Escala de Área (1:N²)
              </span>
              <div className="text-xl font-bold font-mono text-indigo-400">
                {result.areaScaleString}
              </div>
              <span className="text-[10px] text-slate-500">Superfícies 2D</span>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 font-mono block mb-1">
                Escala de Volume (1:N³)
              </span>
              <div className="text-xl font-bold font-mono text-purple-400 truncate">
                {result.volumeScaleString}
              </div>
              <span className="text-[10px] text-slate-500">Sólidos 3D</span>
            </div>
          </div>

          {/* Steps */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200">Demonstração Passo a Passo</h4>
            </div>

            <ol className="space-y-2 text-xs font-mono text-slate-300">
              {result.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-blue-400 font-semibold select-none">{idx + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Python Code */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white font-mono">Script Python 3 de Conversão</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(result.pythonCode)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => handleRunPython(result.pythonCode)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Executar</span>
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-blue-300 overflow-x-auto">
              <code>{result.pythonCode}</code>
            </pre>

            {pyOutput !== null && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-emerald-900/50">
                <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                  Saída do Terminal Python (stdout)
                </span>
                <pre className="font-mono text-xs text-emerald-400 whitespace-pre-wrap">
                  {pyOutput}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
