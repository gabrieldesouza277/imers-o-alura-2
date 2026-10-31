import React, { useState } from 'react';
import { 
  GitFork, 
  HelpCircle, 
  Copy, 
  Check, 
  Play, 
  Coins, 
  Plus, 
  Trash2, 
  ArrowRightLeft, 
  ArrowUpDown 
} from 'lucide-react';
import { calcSimpleRuleOfThree, calcCompoundRuleOfThree } from '../utils/mathFormulas';
import { executePythonCode } from '../utils/pythonEngine';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { CalculationHistoryItem, CompoundRuleMagnitude } from '../types/math';

interface RuleOfThreeProps {
  onAddToHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const RuleOfThreeModule: React.FC<RuleOfThreeProps> = ({ onAddToHistory }) => {
  const [tabType, setTabType] = useState<'simple' | 'compound'>('simple');

  // Simple state
  const [nameA, setNameA] = useState<string>('Velocidade (km/h)');
  const [nameB, setNameB] = useState<string>('Tempo de viagem (h)');
  const [a1, setA1] = useState<number>(60);
  const [b1, setB1] = useState<number>(4);
  const [a2, setA2] = useState<number>(80);
  const [isInverse, setIsInverse] = useState<boolean>(true);

  // Compound state
  const [targetName, setTargetName] = useState<string>('Dias necessários');
  const [targetVal1, setTargetVal1] = useState<number>(12);
  const [magnitudes, setMagnitudes] = useState<CompoundRuleMagnitude[]>([
    { id: '1', name: 'Operários', val1: 6, val2: 8, relationWithTarget: 'inverse' },
    { id: '2', name: 'Horas/Dia', val1: 8, val2: 6, relationWithTarget: 'inverse' },
    { id: '3', name: 'Metros de Muro', val1: 100, val2: 150, relationWithTarget: 'direct' },
  ]);

  const [copied, setCopied] = useState<boolean>(false);
  const [pyOutput, setPyOutput] = useState<string | null>(null);

  // Simple computation
  const simpleResult = (() => {
    try {
      return calcSimpleRuleOfThree(a1, b1, a2, isInverse);
    } catch (e: unknown) {
      return {
        a1,
        b1,
        a2,
        x: 0,
        isInverse,
        steps: [e instanceof Error ? e.message : 'Erro'],
        pythonCode: '# Erro',
      };
    }
  })();

  // Compound computation
  const compoundResult = (() => {
    try {
      return calcCompoundRuleOfThree(targetName, targetVal1, magnitudes);
    } catch (e: unknown) {
      return {
        targetName,
        targetVal1,
        targetX: 0,
        magnitudes,
        steps: [e instanceof Error ? e.message : 'Erro'],
        pythonCode: '# Erro',
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

  const handleAddMagnitude = () => {
    playClickSound(500);
    setMagnitudes((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: `Nova Grandeza ${prev.length + 1}`,
        val1: 10,
        val2: 20,
        relationWithTarget: 'direct',
      },
    ]);
  };

  const handleRemoveMagnitude = (id: string) => {
    playClickSound(450);
    setMagnitudes((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveToHistory = () => {
    playSuccessSound();
    if (tabType === 'simple') {
      onAddToHistory({
        category: 'Regra de Três Simples',
        title: `${nameA} vs ${nameB} (${isInverse ? 'Inversa' : 'Direta'})`,
        expression: isInverse ? `${a1} * ${b1} = ${a2} * X` : `${a1}/${b1} = ${a2}/X`,
        result: `X = ${simpleResult.x.toFixed(4)}`,
        steps: simpleResult.steps,
        pythonCode: simpleResult.pythonCode,
      });
    } else {
      onAddToHistory({
        category: 'Regra de Três Composta',
        title: `Composta: ${targetName} com ${magnitudes.length} variáveis`,
        expression: `X = ${targetVal1} * Fatores`,
        result: `X = ${compoundResult.targetX.toFixed(4)}`,
        steps: compoundResult.steps,
        pythonCode: compoundResult.pythonCode,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab toggle */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800 w-fit">
        <button
          onClick={() => { setTabType('simple'); setPyOutput(null); playClickSound(); }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            tabType === 'simple'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Regra de Três Simples
        </button>
        <button
          onClick={() => { setTabType('compound'); setPyOutput(null); playClickSound(); }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            tabType === 'compound'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Regra de Três Composta (N Grandezas)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <GitFork className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                {tabType === 'simple' ? 'Proporcionalidade de 2 Grandezas' : 'Tabela de Múltiplas Grandezas'}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {tabType === 'simple' ? (isInverse ? 'Inversamente' : 'Diretamente') : `${magnitudes.length + 1} Grandezas`}
            </span>
          </div>

          {tabType === 'simple' ? (
            <div className="space-y-4">
              {/* Direct / Inverse switch */}
              <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInverse(false)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    !isInverse ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Diretamente Proporcional</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsInverse(true)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    isInverse ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Inversamente Proporcional</span>
                </button>
              </div>

              {/* Grid 2x2 with cross-visualizer */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      value={nameA}
                      onChange={(e) => setNameA(e.target.value)}
                      placeholder="Nome Grandeza A"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-medium mb-1.5 focus:outline-none focus:border-blue-500"
                    />
                    <label className="text-[10px] text-slate-500 block mb-1">Estado Inicial (A₁)</label>
                    <input
                      type="number"
                      step="any"
                      value={a1}
                      onChange={(e) => setA1(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={nameB}
                      onChange={(e) => setNameB(e.target.value)}
                      placeholder="Nome Grandeza B"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-medium mb-1.5 focus:outline-none focus:border-blue-500"
                    />
                    <label className="text-[10px] text-slate-500 block mb-1">Estado Inicial (B₁)</label>
                    <input
                      type="number"
                      step="any"
                      value={b1}
                      onChange={(e) => setB1(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Visual arrow divider */}
                <div className="flex items-center justify-center py-1">
                  <div className="h-[1px] bg-slate-800 flex-1" />
                  <span className="px-3 text-[11px] font-mono text-slate-500">
                    {isInverse ? 'Multiplicação Linear (A₁·B₁ = A₂·X)' : 'Multiplicação Cruzada (A₁·X = B₁·A₂)'}
                  </span>
                  <div className="h-[1px] bg-slate-800 flex-1" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Novo Estado (A₂)</label>
                    <input
                      type="number"
                      step="any"
                      value={a2}
                      onChange={(e) => setA2(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Incógnita (X)</label>
                    <div className="w-full bg-blue-950/40 border border-blue-800/50 rounded-xl px-3 py-2 text-blue-400 font-mono font-bold text-sm flex items-center justify-between">
                      <span>X =</span>
                      <span>{simpleResult.x.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div>
                <span className="text-[11px] text-slate-500 block mb-1.5">Exemplos clássicos prontos:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setNameA('Velocidade (km/h)');
                      setNameB('Tempo (horas)');
                      setA1(60);
                      setB1(4);
                      setA2(80);
                      setIsInverse(true);
                    }}
                    className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Velocidade vs Tempo (Inversa)
                  </button>
                  <button
                    onClick={() => {
                      setNameA('Litros de Combustível');
                      setNameB('Distância (km)');
                      setA1(10);
                      setB1(140);
                      setA2(35);
                      setIsInverse(false);
                    }}
                    className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Combustível vs Km (Direta)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Compound Rule */
            <div className="space-y-4">
              {/* Target Magnitudes */}
              <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl">
                <span className="text-xs font-semibold text-blue-400 block mb-2">
                  🎯 Grandeza Alvo (Incógnita X)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Nome da Grandeza</label>
                    <input
                      type="text"
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Valor Inicial (Estado 1)</label>
                    <input
                      type="number"
                      step="any"
                      value={targetVal1}
                      onChange={(e) => setTargetVal1(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic list of magnitudes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Grandezas Relacionadas:
                  </span>
                  <button
                    onClick={handleAddMagnitude}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Grandeza</span>
                  </button>
                </div>

                {magnitudes.map((m, idx) => (
                  <div key={m.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setMagnitudes((prev) => prev.map((item) => (item.id === m.id ? { ...item, name: val } : item)));
                        }}
                        className="bg-transparent font-medium text-xs text-slate-200 focus:outline-none focus:underline"
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={m.relationWithTarget}
                          onChange={(e) => {
                            const val = e.target.value as 'direct' | 'inverse';
                            setMagnitudes((prev) => prev.map((item) => (item.id === m.id ? { ...item, relationWithTarget: val } : item)));
                          }}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[11px] font-mono text-slate-300"
                        >
                          <option value="direct">Diretamente Proporcional</option>
                          <option value="inverse">Inversamente Proporcional</option>
                        </select>
                        {magnitudes.length > 1 && (
                          <button
                            onClick={() => handleRemoveMagnitude(m.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Valor Inicial 1</span>
                        <input
                          type="number"
                          step="any"
                          value={m.val1}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setMagnitudes((prev) => prev.map((item) => (item.id === m.id ? { ...item, val1: val } : item)));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Novo Valor 2</span>
                        <input
                          type="number"
                          step="any"
                          value={m.val2}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setMagnitudes((prev) => prev.map((item) => (item.id === m.id ? { ...item, val2: val } : item)));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
              Algoritmo de Proporcionalidade
            </span>
          </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* Result card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-blue-900/40 rounded-2xl p-6 relative overflow-hidden">
            <span className="text-xs uppercase font-mono tracking-wider text-blue-400 font-semibold block mb-1">
              Valor Incógnito (X)
            </span>
            <div className="text-3xl md:text-4xl font-extrabold font-mono text-white tracking-tight">
              {tabType === 'simple'
                ? simpleResult.x.toLocaleString(undefined, { maximumFractionDigits: 4 })
                : compoundResult.targetX.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              {tabType === 'simple'
                ? `Resultado para ${nameB} quando ${nameA} passa a ser ${a2}`
                : `Novo valor para '${targetName}' considerando as ${magnitudes.length} variações`}
            </p>
          </div>

          {/* Steps */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200">Demonstração Passo a Passo</h4>
            </div>

            <ol className="space-y-2 text-xs font-mono text-slate-300">
              {(tabType === 'simple' ? simpleResult.steps : compoundResult.steps).map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-blue-400 font-semibold select-none">{idx + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Python snippet */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white font-mono">Código Python para Automatização</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(tabType === 'simple' ? simpleResult.pythonCode : compoundResult.pythonCode)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => handleRunPython(tabType === 'simple' ? simpleResult.pythonCode : compoundResult.pythonCode)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Executar</span>
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-blue-300 overflow-x-auto">
              <code>{tabType === 'simple' ? simpleResult.pythonCode : compoundResult.pythonCode}</code>
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
