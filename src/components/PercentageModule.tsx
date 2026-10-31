import React, { useState } from 'react';
import { 
  Percent, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  PiggyBank, 
  Copy, 
  Check, 
  Play, 
  ArrowRight, 
  HelpCircle 
} from 'lucide-react';
import { 
  calcPercentOf, 
  calcIsWhatPercent, 
  calcPercentVariation, 
  calcIncreaseDecrease, 
  calcSimpleInterest, 
  calcCompoundInterest 
} from '../utils/mathFormulas';
import { executePythonCode, downloadPythonScript } from '../utils/pythonEngine';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { CalculationHistoryItem } from '../types/math';

interface PercentageModuleProps {
  onAddToHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const PercentageModule: React.FC<PercentageModuleProps> = ({ onAddToHistory }) => {
  const [subTab, setSubTab] = useState<'percent_of' | 'is_what' | 'variation' | 'increase_decrease' | 'simple_interest' | 'compound_interest'>('percent_of');

  // Mode 1: X% of Y
  const [p1, setP1] = useState<number>(15);
  const [total1, setTotal1] = useState<number>(300);

  // Mode 2: X is what % of Y
  const [part2, setPart2] = useState<number>(45);
  const [total2, setTotal2] = useState<number>(180);

  // Mode 3: Variation from V1 to V2
  const [v1, setV1] = useState<number>(200);
  const [v2, setV2] = useState<number>(260);

  // Mode 4: Increase/Discount
  const [baseVal, setBaseVal] = useState<number>(150);
  const [rateVal, setRateVal] = useState<number>(20);
  const [isIncrease, setIsIncrease] = useState<boolean>(false);

  // Mode 5: Simple Interest
  const [capSim, setCapSim] = useState<number>(1000);
  const [taxSim, setTaxSim] = useState<number>(2.5);
  const [timeSim, setTimeSim] = useState<number>(12);

  // Mode 6: Compound Interest
  const [capComp, setCapComp] = useState<number>(5000);
  const [taxComp, setTaxComp] = useState<number>(1.2);
  const [timeComp, setTimeComp] = useState<number>(24);

  // Python execution state
  const [pyOutput, setPyOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Calculation dispatch
  const getResult = () => {
    try {
      switch (subTab) {
        case 'percent_of':
          return calcPercentOf(p1, total1);
        case 'is_what':
          return calcIsWhatPercent(part2, total2);
        case 'variation':
          return calcPercentVariation(v1, v2);
        case 'increase_decrease':
          return calcIncreaseDecrease(baseVal, rateVal, isIncrease);
        case 'simple_interest':
          return calcSimpleInterest(capSim, taxSim, timeSim);
        case 'compound_interest':
          return calcCompoundInterest(capComp, taxComp, timeComp);
      }
    } catch (e: unknown) {
      return {
        value: 0,
        steps: [e instanceof Error ? e.message : 'Erro no cálculo'],
        pythonCode: '# Erro nos parâmetros informados',
      };
    }
  };

  const currentResult = getResult();

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

    if (subTab === 'percent_of') {
      title = `${p1}% de ${total1}`;
      expr = `(${p1} / 100) * ${total1}`;
    } else if (subTab === 'is_what') {
      title = `${part2} em relação a ${total2}`;
      expr = `(${part2} / ${total2}) * 100%`;
    } else if (subTab === 'variation') {
      title = `Variação de ${v1} para ${v2}`;
      expr = `((${v2} - ${v1}) / ${v1}) * 100%`;
    } else if (subTab === 'increase_decrease') {
      title = `${isIncrease ? 'Acréscimo' : 'Desconto'} de ${rateVal}% em ${baseVal}`;
      expr = `${baseVal} * (1 ${isIncrease ? '+' : '-'} ${rateVal}/100)`;
    } else if (subTab === 'simple_interest') {
      title = `Juros Simples: C=${capSim}, i=${taxSim}%, t=${timeSim}`;
      expr = `J = ${capSim} * ${taxSim / 100} * ${timeSim}`;
    } else {
      title = `Juros Compostos: C=${capComp}, i=${taxComp}%, t=${timeComp}`;
      expr = `M = ${capComp} * (1 + ${taxComp / 100})^${timeComp}`;
    }

    onAddToHistory({
      category: 'Porcentagem',
      title,
      expression: expr,
      result: typeof currentResult.value === 'number' ? Number(currentResult.value.toFixed(4)) : currentResult.value,
      steps: currentResult.steps,
      pythonCode: currentResult.pythonCode,
    });
  };

  return (
    <div className="space-y-6">
      {/* Subtab navigation */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
        <button
          onClick={() => { setSubTab('percent_of'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            subTab === 'percent_of'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          X% de um Valor
        </button>
        <button
          onClick={() => { setSubTab('is_what'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            subTab === 'is_what'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Parte para % Total
        </button>
        <button
          onClick={() => { setSubTab('variation'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            subTab === 'variation'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Variação % (Δ%)
        </button>
        <button
          onClick={() => { setSubTab('increase_decrease'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            subTab === 'increase_decrease'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Acréscimo / Desconto
        </button>
        <button
          onClick={() => { setSubTab('simple_interest'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            subTab === 'simple_interest'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Juros Simples
        </button>
        <button
          onClick={() => { setSubTab('compound_interest'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            subTab === 'compound_interest'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Juros Compostos
        </button>
      </div>

      {/* Grid: Inputs & Live Visual Result */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Input form */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Parâmetros de Entrada</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Fórmula Dinâmica</span>
          </div>

          {/* Subtab 1: X% of Y */}
          {subTab === 'percent_of' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Porcentagem desejada (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={p1}
                    onChange={(e) => setP1(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-500 font-mono text-sm">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Valor Total Base
                </label>
                <input
                  type="number"
                  step="any"
                  value={total1}
                  onChange={(e) => setTotal1(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick presets */}
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 block mb-2">Atalhos rápidos de porcentagem:</span>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15, 20, 25, 50, 75].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setP1(preset)}
                      className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subtab 2: X is what % of Y */}
          {subTab === 'is_what' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Valor da Parte
                </label>
                <input
                  type="number"
                  step="any"
                  value={part2}
                  onChange={(e) => setPart2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Valor Total (Denominador)
                </label>
                <input
                  type="number"
                  step="any"
                  value={total2}
                  onChange={(e) => setTotal2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Subtab 3: Variation */}
          {subTab === 'variation' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Valor Inicial (V₁)
                </label>
                <input
                  type="number"
                  step="any"
                  value={v1}
                  onChange={(e) => setV1(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Valor Final (V₂)
                </label>
                <input
                  type="number"
                  step="any"
                  value={v2}
                  onChange={(e) => setV2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Subtab 4: Increase/Discount */}
          {subTab === 'increase_decrease' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIncrease(false)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    !isIncrease ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Desconto (-)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsIncrease(true)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    isIncrease ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Acréscimo (+)</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Valor Base (R$ ou unidades)
                </label>
                <input
                  type="number"
                  step="any"
                  value={baseVal}
                  onChange={(e) => setBaseVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Taxa do {isIncrease ? 'Acréscimo' : 'Desconto'} (%)
                </label>
                <input
                  type="number"
                  step="any"
                  value={rateVal}
                  onChange={(e) => setRateVal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Subtab 5: Simple Interest */}
          {subTab === 'simple_interest' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Capital Inicial (C)
                </label>
                <input
                  type="number"
                  step="any"
                  value={capSim}
                  onChange={(e) => setCapSim(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Taxa Periódica i (%)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={taxSim}
                    onChange={(e) => setTaxSim(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Tempo / Períodos (t)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={timeSim}
                    onChange={(e) => setTimeSim(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Subtab 6: Compound Interest */}
          {subTab === 'compound_interest' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Capital Investido (C)
                </label>
                <input
                  type="number"
                  step="any"
                  value={capComp}
                  onChange={(e) => setCapComp(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Taxa Composta i (%/período)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={taxComp}
                    onChange={(e) => setTaxComp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Número de Períodos (t)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={timeComp}
                    onChange={(e) => setTimeComp(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleSaveToHistory}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Salvar no Histórico</span>
            </button>
            <span className="text-xs text-slate-500 font-mono">
              Auto-atualização ativa
            </span>
          </div>
        </div>

        {/* Right Card: Result & Step-by-Step Resolution */}
        <div className="lg:col-span-6 space-y-6">
          {/* Highlight Result Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-blue-900/40 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-10">
              <Percent className="w-24 h-24 text-blue-400" />
            </div>

            <span className="text-xs uppercase font-mono tracking-wider text-blue-400 font-semibold block mb-1">
              Resultado Calculado
            </span>
            <div className="text-3xl md:text-4xl font-extrabold font-mono text-white tracking-tight">
              {typeof currentResult.value === 'number'
                ? currentResult.value.toLocaleString(undefined, { maximumFractionDigits: 4 })
                : currentResult.value}
              {subTab === 'is_what' || subTab === 'variation' ? '%' : ''}
            </div>

            <p className="text-xs text-slate-400 mt-2">
              {subTab === 'percent_of' && `${p1}% do valor total de ${total1}`}
              {subTab === 'is_what' && `${part2} equivale a ${currentResult.value.toFixed(2)}% de ${total2}`}
              {subTab === 'variation' && `${currentResult.value >= 0 ? 'Aumento' : 'Queda'} de ${Math.abs(currentResult.value).toFixed(2)}%`}
              {subTab === 'increase_decrease' && `Novo valor após ${isIncrease ? 'acréscimo' : 'desconto'} de ${rateVal}%`}
              {subTab === 'simple_interest' && `Montante final acumulado sob regime simples`}
              {subTab === 'compound_interest' && `Montante final acumulado exponencialmente`}
            </p>
          </div>

          {/* Step-by-Step Resolution */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200">Demonstração Passo a Passo</h4>
            </div>

            <ol className="space-y-2 text-xs font-mono text-slate-300">
              {currentResult.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-blue-400 font-semibold select-none">{idx + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Generated Python Script */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white font-mono">Código Python 3 Equivalente</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(currentResult.pythonCode)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => handleRunPython(currentResult.pythonCode)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Executar</span>
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-blue-300 overflow-x-auto">
              <code>{currentResult.pythonCode}</code>
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
