import React, { useState } from 'react';
import { 
  Dice5, 
  HelpCircle, 
  Copy, 
  Check, 
  Play, 
  Coins, 
  BarChart3, 
  Binary 
} from 'lucide-react';
import { 
  calcCombinatorics, 
  calcBinomial, 
  calcBayesTheorem, 
  factorial 
} from '../utils/mathFormulas';
import { executePythonCode } from '../utils/pythonEngine';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { CalculationHistoryItem } from '../types/math';

interface ProbabilityModuleProps {
  onAddToHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const ProbabilityModule: React.FC<ProbabilityModuleProps> = ({ onAddToHistory }) => {
  const [activeTab, setActiveTab] = useState<'combinatorics' | 'binomial' | 'bayes' | 'classical'>('combinatorics');

  // Combinatorics state
  const [combType, setCombType] = useState<'factorial' | 'permutation' | 'arrangement' | 'combination'>('combination');
  const [combN, setCombN] = useState<number>(10);
  const [combP, setCombP] = useState<number>(3);

  // Binomial state
  const [binN, setBinN] = useState<number>(10);
  const [binP, setBinP] = useState<number>(0.5);
  const [binK, setBinK] = useState<number>(5);

  // Bayes state
  const [bayesPA, setBayesPA] = useState<number>(0.01);
  const [bayesPBgivenA, setBayesPBgivenA] = useState<number>(0.95);
  const [bayesPBgivenNotA, setBayesPBgivenNotA] = useState<number>(0.05);

  // Classical state
  const [favorableEvents, setFavorableEvents] = useState<number>(3);
  const [sampleSpace, setSampleSpace] = useState<number>(6);

  const [copied, setCopied] = useState<boolean>(false);
  const [pyOutput, setPyOutput] = useState<string | null>(null);

  // Combinatorics computation
  const combResult = (() => {
    try {
      return calcCombinatorics(combType, combN, combP);
    } catch (e: unknown) {
      return {
        n: combN,
        p: combP,
        result: 0,
        formula: '',
        steps: [e instanceof Error ? e.message : 'Erro'],
        pythonCode: '# Erro nos parâmetros',
      };
    }
  })();

  // Binomial computation
  const binResult = (() => {
    try {
      return calcBinomial(binN, binP, binK);
    } catch (e: unknown) {
      return {
        n: binN,
        p: binP,
        k: binK,
        probExact: 0,
        probAtMost: 0,
        probAtLeast: 0,
        expectedValue: 0,
        variance: 0,
        points: [],
        pythonCode: '# Erro',
        steps: [e instanceof Error ? e.message : 'Erro'],
      };
    }
  })();

  // Bayes computation
  const bayesResult = (() => {
    try {
      return calcBayesTheorem(bayesPA, bayesPBgivenA, bayesPBgivenNotA);
    } catch (e: unknown) {
      return {
        probAGivenB: 0,
        probB: 0,
        steps: [e instanceof Error ? e.message : 'Erro'],
        pythonCode: '# Erro',
      };
    }
  })();

  // Classical computation
  const classicalResult = (() => {
    if (sampleSpace <= 0 || favorableEvents < 0) {
      return {
        prob: 0,
        steps: ['O espaço amostral deve ser maior que zero e os eventos favoráveis >= 0.'],
        pythonCode: '# Parâmetros inválidos',
      };
    }
    const prob = favorableEvents / sampleSpace;
    const steps = [
      `Espaço Amostral: n(Ω) = ${sampleSpace}`,
      `Eventos Favoráveis: n(A) = ${favorableEvents}`,
      `Fórmula Clássica: P(A) = n(A) / n(Ω) = ${favorableEvents} / ${sampleSpace}`,
      `Probabilidade: ${prob.toFixed(6)} (${(prob * 100).toFixed(2)}%)`,
      `Evento Complementar P(A'): 1 - P(A) = ${(1 - prob).toFixed(6)} (${((1 - prob) * 100).toFixed(2)}%)`,
    ];
    const pythonCode = `from fractions import Fraction

n_favoraveis = ${favorableEvents}
espaco_amostral = ${sampleSpace}

probabilidade = n_favoraveis / espaco_amostral
fracao = Fraction(n_favoraveis, espaco_amostral)

print(f"P(A) = {probabilidade:.4f} ({probabilidade * 100:.2f}%)")
print(f"Fração Irredutível: {fracao}")
`;
    return { prob, steps, pythonCode };
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
    if (activeTab === 'combinatorics') {
      onAddToHistory({
        category: 'Combinatória',
        title: `${combType.toUpperCase()} (n=${combN}${combType === 'arrangement' || combType === 'combination' ? `, p=${combP}` : ''})`,
        expression: combResult.formula,
        result: combResult.result.toLocaleString(),
        steps: combResult.steps,
        pythonCode: combResult.pythonCode,
      });
    } else if (activeTab === 'binomial') {
      onAddToHistory({
        category: 'Distribuição Binomial',
        title: `Binomial n=${binN}, p=${binP}, k=${binK}`,
        expression: `P(X=${binK})`,
        result: `${(binResult.probExact * 100).toFixed(4)}%`,
        steps: binResult.steps,
        pythonCode: binResult.pythonCode,
      });
    } else if (activeTab === 'bayes') {
      onAddToHistory({
        category: 'Teorema de Bayes',
        title: `P(A|B) com P(A)=${bayesPA}`,
        expression: `P(A|B) = [P(B|A)P(A)]/P(B)`,
        result: `${(bayesResult.probAGivenB * 100).toFixed(4)}%`,
        steps: bayesResult.steps,
        pythonCode: bayesResult.pythonCode,
      });
    } else {
      onAddToHistory({
        category: 'Probabilidade Clássica',
        title: `P(A) = ${favorableEvents}/${sampleSpace}`,
        expression: `${favorableEvents} / ${sampleSpace}`,
        result: `${(classicalResult.prob * 100).toFixed(2)}%`,
        steps: classicalResult.steps,
        pythonCode: classicalResult.pythonCode,
      });
    }
  };

  // Get current active code and steps for display
  const getCurrentDisplay = () => {
    if (activeTab === 'combinatorics') {
      return {
        value: combResult.result.toLocaleString(),
        sub: combResult.formula,
        steps: combResult.steps,
        code: combResult.pythonCode,
      };
    }
    if (activeTab === 'binomial') {
      return {
        value: `${(binResult.probExact * 100).toFixed(3)}%`,
        sub: `P(X = ${binK}) exato | Acumulado P(X ≤ ${binK}) = ${(binResult.probAtMost * 100).toFixed(2)}%`,
        steps: binResult.steps,
        code: binResult.pythonCode,
      };
    }
    if (activeTab === 'bayes') {
      return {
        value: `${(bayesResult.probAGivenB * 100).toFixed(3)}%`,
        sub: `P(A|B) Posterior Calculada | P(B) Total = ${(bayesResult.probB * 100).toFixed(3)}%`,
        steps: bayesResult.steps,
        code: bayesResult.pythonCode,
      };
    }
    return {
      value: `${(classicalResult.prob * 100).toFixed(2)}%`,
      sub: `${favorableEvents} casos favoráveis em ${sampleSpace} possíveis`,
      steps: classicalResult.steps,
      code: classicalResult.pythonCode,
    };
  };

  const currentDisplay = getCurrentDisplay();

  return (
    <div className="space-y-6">
      {/* Subtab selection */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
        <button
          onClick={() => { setActiveTab('combinatorics'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'combinatorics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Análise Combinatória
        </button>
        <button
          onClick={() => { setActiveTab('binomial'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'binomial'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Distribuição Binomial
        </button>
        <button
          onClick={() => { setActiveTab('bayes'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'bayes'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Teorema de Bayes
        </button>
        <button
          onClick={() => { setActiveTab('classical'); setPyOutput(null); playClickSound(); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'classical'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          Probabilidade Clássica
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Input configuration */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Dice5 className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                {activeTab === 'combinatorics' && 'Configuração de Combinatória'}
                {activeTab === 'binomial' && 'Parâmetros do Experimento de Bernoulli'}
                {activeTab === 'bayes' && 'Probabilidades Condicionais'}
                {activeTab === 'classical' && 'Espaço Amostral & Eventos'}
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Módulo Estocástico</span>
          </div>

          {/* Combinatorics form */}
          {activeTab === 'combinatorics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'combination', label: 'Combinação C(n,p)' },
                  { id: 'arrangement', label: 'Arranjo A(n,p)' },
                  { id: 'permutation', label: 'Permutação P(n)' },
                  { id: 'factorial', label: 'Fatorial (n!)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCombType(item.id as typeof combType)}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                      combType === item.id
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Total de Elementos (n)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={combN}
                    onChange={(e) => setCombN(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                {(combType === 'combination' || combType === 'arrangement') && (
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Agrupamento (p)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={combN}
                      value={combP}
                      onChange={(e) => setCombP(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                {combType === 'combination' && 'Combinações: A ordem dos elementos NÃO altera o grupo (ex: comissões, mega-sena, cartas).'}
                {combType === 'arrangement' && 'Arranjos: A ordem dos elementos IMPORTA e cria agrupamentos diferentes (ex: senhas, pódio de corrida).'}
                {combType === 'permutation' && 'Permutações: Troca de ordem entre todos os n elementos (ex: anagramas).'}
                {combType === 'factorial' && 'Fatorial: Produto de todos os inteiros positivos menores ou iguais a n.'}
              </div>
            </div>
          )}

          {/* Binomial form */}
          {activeTab === 'binomial' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Tentativas (n)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={binN}
                    onChange={(e) => setBinN(Math.min(60, parseInt(e.target.value) || 1))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Prob. Sucesso (p)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={binP}
                    onChange={(e) => setBinP(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Sucessos (k)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={binN}
                    value={binK}
                    onChange={(e) => setBinK(Math.min(binN, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Interactive Probability Distribution Bar Chart */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    Curva de Probabilidade Binomial P(X=k)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    E[X] = {binResult.expectedValue.toFixed(2)}
                  </span>
                </div>

                <div className="h-32 flex items-end gap-1 pt-4 pb-1 overflow-x-auto">
                  {binResult.points.slice(0, 30).map((pt) => {
                    const isTarget = pt.k === binK;
                    const maxP = Math.max(...binResult.points.map((p) => p.prob), 0.01);
                    const heightPct = Math.max(4, (pt.prob / maxP) * 100);

                    return (
                      <div
                        key={pt.k}
                        onClick={() => setBinK(pt.k)}
                        className="flex-1 min-w-[12px] flex flex-col items-center cursor-pointer group"
                        title={`k=${pt.k}: ${(pt.prob * 100).toFixed(2)}%`}
                      >
                        <div
                          style={{ height: `${heightPct}%` }}
                          className={`w-full rounded-t transition-all ${
                            isTarget
                              ? 'bg-blue-500 shadow-md shadow-blue-500/50'
                              : 'bg-slate-700 hover:bg-slate-600'
                          }`}
                        />
                        <span className={`text-[9px] font-mono mt-1 ${isTarget ? 'text-blue-400 font-bold' : 'text-slate-500'}`}>
                          {pt.k}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bayes form */}
          {activeTab === 'bayes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Probabilidade a priori P(A)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  value={bayesPA}
                  onChange={(e) => setBayesPA(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Sensibilidade P(B | A)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={bayesPBgivenA}
                    onChange={(e) => setBayesPBgivenA(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Falso Positivo P(B | ¬A)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={bayesPBgivenNotA}
                    onChange={(e) => setBayesPBgivenNotA(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
                Utilizado universalmente em diagnósticos médicos (teste positivo indicando doença real), filtros de spam e machine learning bayesiano.
              </div>
            </div>
          )}

          {/* Classical form */}
          {activeTab === 'classical' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Número de Casos Favoráveis: n(A)
                </label>
                <input
                  type="number"
                  min="0"
                  value={favorableEvents}
                  onChange={(e) => setFavorableEvents(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Espaço Amostral Total: n(Ω)
                </label>
                <input
                  type="number"
                  min="1"
                  value={sampleSpace}
                  onChange={(e) => setSampleSpace(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2">
                {[
                  { label: 'Dado (1 dado = 6)', fav: 1, total: 6 },
                  { label: 'Moeda Cara/Coroa', fav: 1, total: 2 },
                  { label: 'Baralho (Ás = 4/52)', fav: 4, total: 52 },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setFavorableEvents(item.fav); setSampleSpace(item.total); }}
                    className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    {item.label}
                  </button>
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
              Biblioteca Python math integrada
            </span>
          </div>
        </div>

        {/* Right Card: Result & Python */}
        <div className="lg:col-span-6 space-y-6">
          {/* Highlight Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/40 border border-purple-900/40 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute right-4 top-4 opacity-10">
              <Binary className="w-24 h-24 text-purple-400" />
            </div>

            <span className="text-xs uppercase font-mono tracking-wider text-purple-400 font-semibold block mb-1">
              Resultado Probabilístico
            </span>
            <div className="text-3xl md:text-4xl font-extrabold font-mono text-white tracking-tight">
              {currentDisplay.value}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              {currentDisplay.sub}
            </p>
          </div>

          {/* Steps */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-200">Demonstração Passo a Passo</h4>
            </div>

            <ol className="space-y-2 text-xs font-mono text-slate-300">
              {currentDisplay.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/50 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-purple-400 font-semibold select-none">{idx + 1}.</span>
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
                <h4 className="text-xs font-bold text-white font-mono">Implementação Python (math/scipy)</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyCode(currentDisplay.code)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={() => handleRunPython(currentDisplay.code)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Executar</span>
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-purple-300 overflow-x-auto">
              <code>{currentDisplay.code}</code>
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
