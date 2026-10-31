import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Download, 
  RotateCcw, 
  BookOpen, 
  Sparkles, 
  Code2 
} from 'lucide-react';
import { executePythonCode, downloadPythonScript } from '../utils/pythonEngine';
import { playClickSound, playSuccessSound } from '../utils/audio';

const PYTHON_SNIPPETS = [
  {
    title: 'Regra de Três Composta Completa',
    category: 'Álgebra',
    code: `# Regra de Três Composta em Python 3
# Exemplo: 6 operários trabalhando 8 horas/dia constroem 100m de muro em 12 dias.
# Quantos dias levarão 8 operários trabalhando 6 horas/dia para construir 150m?

target_dias_inicial = 12

# Relações:
# Operários (mais operários -> menos dias) = INVERSA
# Horas/dia (mais horas/dia -> menos dias) = INVERSA
# Metros (mais metros -> mais dias) = DIRETA

razao_operarios = 6 / 8        # Inversa: inicial / final
razao_horas = 8 / 6            # Inversa: inicial / final
razao_metros = 150 / 100       # Direta: final / inicial

fator_total = razao_operarios * razao_horas * razao_metros
dias_finais = target_dias_inicial * fator_total

print(f"Fator multiplicador total: {fator_total:.4f}")
print(f"Total de dias necessários: {dias_finais:.2f} dias")
`,
  },
  {
    title: 'Geometria Espacial: Cilindro e Tronco de Cone',
    category: 'Geometria Espacial',
    code: `import math

# Volume e Área Total de Tronco de Cone
R = 8.0   # Raio maior
r = 4.0   # Raio menor
h = 10.0  # Altura

geratriz = math.hypot(h, R - r)
area_lateral = math.pi * (R + r) * geratriz
area_bases = math.pi * (R**2 + r**2)
area_total = area_lateral + area_bases
volume = (math.pi * h / 3.0) * (R**2 + R*r + r**2)

print(f"Geratriz do Tronco: {geratriz:.4f} cm")
print(f"Área Total: {area_total:.4f} cm²")
print(f"Volume do Tronco de Cone: {volume:.4f} cm³")
`,
  },
  {
    title: 'Distribuição Binomial & Teorema de Bayes',
    category: 'Probabilidade',
    code: `import math

# Experimento Binomial: 10 lançamentos de moeda equilibrada (p = 0.5)
# Qual a chance de obter exatamente 5 caras?
n = 10
p = 0.5
k = 5
q = 1 - p

prob_k5 = math.comb(n, k) * (p ** k) * (q ** (n - k))
prob_ate_5 = sum(math.comb(n, i) * (p ** i) * (q ** (n - i)) for i in range(k + 1))

print(f"P(X = {k}): {prob_k5:.6f} ({prob_k5 * 100:.2f}%)")
print(f"P(X <= {k}): {prob_ate_5:.6f} ({prob_ate_5 * 100:.2f}%)")
`,
  },
  {
    title: 'Escala Cartográfica e Conversão de Unidades',
    category: 'Escala',
    code: `# Conversor Universal de Escala 1:50.000
escala = 50000
distancia_papel_cm = 7.5

# 1 cm no papel = 50.000 cm reais
real_cm = distancia_papel_cm * escala
real_metros = real_cm / 100
real_km = real_metros / 1000

print(f"Distância no mapa: {distancia_papel_cm} cm")
print(f"Distância Real: {real_metros:,.1f} metros ({real_km:.2f} km)")
`,
  },
];

export const PythonStudio: React.FC = () => {
  const [code, setCode] = useState<string>(PYTHON_SNIPPETS[0].code);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [execTime, setExecTime] = useState<number | null>(null);

  const handleRun = () => {
    playClickSound(700);
    setIsRunning(true);
    setTimeout(() => {
      const res = executePythonCode(code);
      if (res.success) {
        playSuccessSound();
        setOutput(res.output);
      } else {
        setOutput(res.error || 'Erro na execução');
      }
      setExecTime(res.executionTimeMs);
      setIsRunning(false);
    }, 50);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    playClickSound(650);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    playClickSound(600);
    downloadPythonScript('calculadora_matematica.py', code);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Laboratório e Editor Python 3</h2>
            <p className="text-xs text-slate-400">
              Edite, teste scripts de matemática, calcule com a biblioteca standard e exporte arquivos .py
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar .py</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/25 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunning ? 'Executando...' : 'Executar Script'}</span>
          </button>
        </div>
      </div>

      {/* Snippet presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          Exemplos prontos:
        </span>
        {PYTHON_SNIPPETS.map((snip, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCode(snip.code);
              setOutput('');
              playClickSound(500);
            }}
            className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            {snip.title}
          </button>
        ))}
      </div>

      {/* Split Code Editor & Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Code Editor */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-400">editor.py</span>
            <span className="text-[11px] font-mono text-slate-500">Python 3.12 Syntax</span>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl border border-slate-800/80 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
          />
        </div>

        {/* Console Terminal */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Console / Terminal de Saída</span>
            </div>
            {execTime !== null && (
              <span className="text-[10px] font-mono text-slate-500">
                {execTime}ms
              </span>
            )}
          </div>

          <div className="flex-1 min-h-[300px] bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-y-auto whitespace-pre-wrap">
            {output ? output : (
              <span className="text-slate-600">
                # Clique em 'Executar Script' para rodar o código e visualizar o output no terminal...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
