import React, { useState } from 'react';
import { 
  Calculator, 
  Delete, 
  RotateCcw, 
  Copy, 
  Check, 
  Play, 
  Coins, 
  HelpCircle, 
  Sparkles 
} from 'lucide-react';
import { executePythonCode } from '../utils/pythonEngine';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { CalculationHistoryItem } from '../types/math';

interface ScientificCalcProps {
  onAddToHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
  onOpenAntigravity: () => void;
}

export const ScientificCalc: React.FC<ScientificCalcProps> = ({ onAddToHistory, onOpenAntigravity }) => {
  const [expression, setExpression] = useState<string>('2 * math.pi * 5');
  const [displayResult, setDisplayResult] = useState<string>('31.4159');
  const [copied, setCopied] = useState<boolean>(false);
  const [pyOutput, setPyOutput] = useState<string | null>(null);

  const calculateExpression = (expr: string) => {
    try {
      const wrapped = `# Calculadora Científica Python\nimport math\n\nresultado = ${expr}\nprint(f"Resultado: {resultado}")\n`;
      const res = executePythonCode(wrapped);
      if (res.success) {
        // Extract result
        const match = res.output.match(/Resultado:\s*(.+)/);
        if (match) {
          const val = match[1].trim();
          setDisplayResult(val);
        } else {
          setDisplayResult(res.output);
        }
      } else {
        setDisplayResult('Erro de sintaxe');
      }
    } catch {
      setDisplayResult('Erro');
    }
  };

  const handleKey = (key: string) => {
    playClickSound(520);
    let next = expression;
    if (key === 'C') {
      next = '';
      setDisplayResult('0');
      setExpression('');
      return;
    }
    if (key === 'DEL') {
      next = expression.slice(0, -1);
      setExpression(next);
      if (next) calculateExpression(next);
      return;
    }
    if (key === '=') {
      playSuccessSound();
      calculateExpression(expression);
      return;
    }

    // Insert functions
    if (key === 'sqrt') next += 'math.sqrt(';
    else if (key === 'sin') next += 'math.sin(';
    else if (key === 'cos') next += 'math.cos(';
    else if (key === 'tan') next += 'math.tan(';
    else if (key === 'log') next += 'math.log10(';
    else if (key === 'ln') next += 'math.log(';
    else if (key === 'pi') next += 'math.pi';
    else if (key === 'e') next += 'math.e';
    else if (key === '^') next += '**';
    else if (key === 'fact') next += 'math.factorial(';
    else next += key;

    setExpression(next);
    calculateExpression(next);
  };

  const generatedPythonCode = `# Calculadora Geral em Python 3
import math

# Expressão avaliada:
expressao = "${expression.replace(/"/g, '\\"')}"
resultado = ${expression || '0'}

print(f"Expressão: {expressao}")
print(f"Resultado: {resultado}")
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedPythonCode);
    setCopied(true);
    playClickSound(650);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunPython = () => {
    playClickSound(700);
    const res = executePythonCode(generatedPythonCode);
    if (res.success) {
      playSuccessSound();
      setPyOutput(res.output);
    } else {
      setPyOutput(res.error || 'Erro na execução');
    }
  };

  const handleSaveToHistory = () => {
    playSuccessSound();
    onAddToHistory({
      category: 'Calculadora Científica',
      title: expression,
      expression,
      result: displayResult,
      steps: [
        `Expressão de entrada: ${expression}`,
        `Módulo matemático: python standard math library`,
        `Valor avaliado: ${displayResult}`,
      ],
      pythonCode: generatedPythonCode,
    });
  };

  const buttons = [
    { label: 'C', val: 'C', color: 'bg-rose-950/40 text-rose-300 border-rose-800/60' },
    { label: 'DEL', val: 'DEL', color: 'bg-slate-800 text-slate-300' },
    { label: '(', val: '(', color: 'bg-slate-800 text-blue-300' },
    { label: ')', val: ')', color: 'bg-slate-800 text-blue-300' },
    { label: '√x', val: 'sqrt', color: 'bg-slate-800 text-indigo-300' },
    { label: 'xʸ', val: '^', color: 'bg-slate-800 text-indigo-300' },

    { label: 'sin', val: 'sin', color: 'bg-slate-800/80 text-cyan-300' },
    { label: 'cos', val: 'cos', color: 'bg-slate-800/80 text-cyan-300' },
    { label: 'tan', val: 'tan', color: 'bg-slate-800/80 text-cyan-300' },
    { label: '7', val: '7', color: 'bg-slate-900 text-white font-bold' },
    { label: '8', val: '8', color: 'bg-slate-900 text-white font-bold' },
    { label: '9', val: '9', color: 'bg-slate-900 text-white font-bold' },
    { label: '÷', val: ' / ', color: 'bg-amber-950/40 text-amber-300 border-amber-800/50' },

    { label: 'ln', val: 'ln', color: 'bg-slate-800/80 text-cyan-300' },
    { label: 'log', val: 'log', color: 'bg-slate-800/80 text-cyan-300' },
    { label: 'n!', val: 'fact', color: 'bg-slate-800/80 text-cyan-300' },
    { label: '4', val: '4', color: 'bg-slate-900 text-white font-bold' },
    { label: '5', val: '5', color: 'bg-slate-900 text-white font-bold' },
    { label: '6', val: '6', color: 'bg-slate-900 text-white font-bold' },
    { label: '×', val: ' * ', color: 'bg-amber-950/40 text-amber-300 border-amber-800/50' },

    { label: 'π', val: 'pi', color: 'bg-slate-800/80 text-emerald-300' },
    { label: 'e', val: 'e', color: 'bg-slate-800/80 text-emerald-300' },
    { label: '%', val: ' % ', color: 'bg-slate-800/80 text-emerald-300' },
    { label: '1', val: '1', color: 'bg-slate-900 text-white font-bold' },
    { label: '2', val: '2', color: 'bg-slate-900 text-white font-bold' },
    { label: '3', val: '3', color: 'bg-slate-900 text-white font-bold' },
    { label: '-', val: ' - ', color: 'bg-amber-950/40 text-amber-300 border-amber-800/50' },

    { label: '0', val: '0', color: 'bg-slate-900 text-white font-bold col-span-2' },
    { label: '.', val: '.', color: 'bg-slate-900 text-white font-bold' },
    { label: '=', val: '=', color: 'bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 col-span-2' },
    { label: '+', val: ' + ', color: 'bg-amber-950/40 text-amber-300 border-amber-800/50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Calculator keypad */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Calculadora Científica Python</h3>
            </div>
            <button
              onClick={onOpenAntigravity}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Flutuar em Gravidade Zero</span>
            </button>
          </div>

          {/* Calculator screen */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <input
              type="text"
              value={expression}
              onChange={(e) => {
                setExpression(e.target.value);
                calculateExpression(e.target.value);
              }}
              placeholder="Digite a expressão..."
              className="w-full bg-transparent text-right font-mono text-base text-slate-300 focus:outline-none"
            />
            <div className="text-right text-3xl font-mono font-extrabold text-blue-400 truncate">
              {displayResult}
            </div>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {buttons.map((b, idx) => (
              <button
                key={idx}
                onClick={() => handleKey(b.val)}
                className={`py-3 rounded-xl text-xs font-mono border border-slate-800/80 hover:brightness-125 active:scale-95 transition-all flex items-center justify-center ${b.color}`}
              >
                {b.label}
              </button>
            ))}
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
              Suporte a math.sin, math.comb, etc.
            </span>
          </div>
        </div>

        {/* Right Column: Python Output & Shortcuts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white font-mono">Código Python Gerado</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button
                  onClick={handleRunPython}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Executar</span>
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono text-xs text-blue-300 overflow-x-auto">
              <code>{generatedPythonCode}</code>
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

          {/* Quick Mathematical Presets */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-300">Expressões Matemáticas Prontas</h4>
            <div className="space-y-2">
              {[
                { label: 'Área do Círculo de Raio 5', expr: 'math.pi * (5 ** 2)' },
                { label: 'Hipotenusa com Catetos 3 e 4', expr: 'math.hypot(3, 4)' },
                { label: 'Combinação de 10 elementos 3 a 3', expr: 'math.comb(10, 3)' },
                { label: 'Seno de 45 graus', expr: 'math.sin(math.radians(45))' },
                { label: 'Logaritmo na base 10 de 1000', expr: 'math.log10(1000)' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setExpression(p.expr);
                    calculateExpression(p.expr);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-mono text-slate-300 transition-colors flex items-center justify-between"
                >
                  <span>{p.label}</span>
                  <span className="text-blue-400 text-[11px] font-semibold">Carregar</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
