import React, { useState } from 'react';
import { 
  Shapes, 
  HelpCircle, 
  Copy, 
  Check, 
  Play, 
  Coins, 
  Eye 
} from 'lucide-react';
import { 
  calcSquare, 
  calcRectangle, 
  calcTriangle, 
  calcCircle, 
  calcCircularSector, 
  calcTrapezoid, 
  calcRhombus, 
  calcRegularPolygon 
} from '../utils/mathFormulas';
import { executePythonCode } from '../utils/pythonEngine';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { CalculationHistoryItem, PlaneGeometryResult } from '../types/math';

interface PlaneGeometryProps {
  onAddToHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const PlaneGeometryModule: React.FC<PlaneGeometryProps> = ({ onAddToHistory }) => {
  const [shape, setShape] = useState<'square' | 'rectangle' | 'triangle' | 'circle' | 'sector' | 'trapezoid' | 'rhombus' | 'regular_polygon'>('circle');

  // Square
  const [squareSide, setSquareSide] = useState<number>(6);

  // Rectangle
  const [rectBase, setRectBase] = useState<number>(8);
  const [rectHeight, setRectHeight] = useState<number>(5);

  // Triangle
  const [triA, setTriA] = useState<number>(6);
  const [triB, setTriB] = useState<number>(8);
  const [triC, setTriC] = useState<number>(10);

  // Circle
  const [circleRadius, setCircleRadius] = useState<number>(7);

  // Sector
  const [sectorRadius, setSectorRadius] = useState<number>(6);
  const [sectorAngle, setSectorAngle] = useState<number>(60);

  // Trapezoid
  const [trapBig, setTrapBig] = useState<number>(12);
  const [trapSmall, setTrapSmall] = useState<number>(8);
  const [trapHeight, setTrapHeight] = useState<number>(5);
  const [trapSide1, setTrapSide1] = useState<number>(6);
  const [trapSide2, setTrapSide2] = useState<number>(6);

  // Rhombus
  const [rhombusD, setRhombusD] = useState<number>(10);
  const [rhombusd, setRhombusd] = useState<number>(6);

  // Regular polygon
  const [polySides, setPolySides] = useState<number>(6);
  const [polySideLength, setPolySideLength] = useState<number>(5);

  const [copied, setCopied] = useState<boolean>(false);
  const [pyOutput, setPyOutput] = useState<string | null>(null);

  const getResult = (): PlaneGeometryResult => {
    try {
      switch (shape) {
        case 'square':
          return calcSquare(squareSide);
        case 'rectangle':
          return calcRectangle(rectBase, rectHeight);
        case 'triangle':
          return calcTriangle(triA, triB, triC);
        case 'circle':
          return calcCircle(circleRadius);
        case 'sector':
          return calcCircularSector(sectorRadius, sectorAngle);
        case 'trapezoid':
          return calcTrapezoid(trapBig, trapSmall, trapHeight, trapSide1, trapSide2);
        case 'rhombus':
          return calcRhombus(rhombusD, rhombusd);
        case 'regular_polygon':
          return calcRegularPolygon(polySides, polySideLength);
      }
    } catch (e: unknown) {
      return {
        shape,
        area: 0,
        perimeter: 0,
        steps: [e instanceof Error ? e.message : 'Erro nos valores'],
        pythonCode: '# Erro',
      };
    }
  };

  const result = getResult();

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
    const shapeNames: Record<string, string> = {
      square: 'Quadrado',
      rectangle: 'Retângulo',
      triangle: 'Triângulo',
      circle: 'Círculo',
      sector: 'Setor Circular',
      trapezoid: 'Trapézio',
      rhombus: 'Losango',
      regular_polygon: `Polígono Regular (${polySides} lados)`,
    };

    onAddToHistory({
      category: 'Geometria Plana',
      title: `${shapeNames[shape]} (Área = ${result.area.toFixed(2)})`,
      expression: `Área = ${result.area.toFixed(4)}, Perímetro = ${result.perimeter.toFixed(4)}`,
      result: `A = ${result.area.toFixed(2)} | P = ${result.perimeter.toFixed(2)}`,
      steps: result.steps,
      pythonCode: result.pythonCode,
    });
  };

  // Render 2D SVG preview with dimensions
  const renderSVGDiagram = () => {
    switch (shape) {
      case 'circle':
        return (
          <svg className="w-full h-44" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="70" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="2.5" />
            <line x1="100" y1="100" x2="170" y2="100" stroke="#60a5fa" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="3.5" fill="#60a5fa" />
            <text x="135" y="93" fill="#93c5fd" fontSize="12" textAnchor="middle" fontFamily="monospace">
              r = {circleRadius}
            </text>
            <text x="100" y="105" fill="#38bdf8" fontSize="11" textAnchor="middle" dy="16" fontFamily="monospace">
              A = πr²
            </text>
          </svg>
        );
      case 'square':
        return (
          <svg className="w-full h-44" viewBox="0 0 200 200">
            <rect x="50" y="50" width="100" height="100" rx="4" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="2.5" />
            <line x1="50" y1="50" x2="150" y2="150" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="100" y="42" fill="#93c5fd" fontSize="12" textAnchor="middle" fontFamily="monospace">
              L = {squareSide}
            </text>
            <text x="165" y="105" fill="#93c5fd" fontSize="12" textAnchor="middle" fontFamily="monospace">
              L = {squareSide}
            </text>
          </svg>
        );
      case 'rectangle':
        return (
          <svg className="w-full h-44" viewBox="0 0 220 180">
            <rect x="30" y="50" width="160" height="80" rx="4" fill="rgba(59, 130, 246, 0.15)" stroke="#3b82f6" strokeWidth="2.5" />
            <text x="110" y="40" fill="#93c5fd" fontSize="12" textAnchor="middle" fontFamily="monospace">
              base = {rectBase}
            </text>
            <text x="202" y="95" fill="#93c5fd" fontSize="12" textAnchor="middle" fontFamily="monospace">
              h = {rectHeight}
            </text>
          </svg>
        );
      case 'triangle':
        return (
          <svg className="w-full h-44" viewBox="0 0 220 180">
            <polygon points="110,35 40,145 180,145" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="2.5" />
            <text x="70" y="80" fill="#6ee7b7" fontSize="11" textAnchor="middle" fontFamily="monospace">
              a = {triA}
            </text>
            <text x="155" y="80" fill="#6ee7b7" fontSize="11" textAnchor="middle" fontFamily="monospace">
              b = {triB}
            </text>
            <text x="110" y="162" fill="#6ee7b7" fontSize="11" textAnchor="middle" fontFamily="monospace">
              c = {triC}
            </text>
          </svg>
        );
      case 'sector':
        return (
          <svg className="w-full h-44" viewBox="0 0 200 200">
            <path d="M 100,100 L 170,100 A 70,70 0 0,0 135,39 Z" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="135" y="93" fill="#fcd34d" fontSize="11" textAnchor="middle" fontFamily="monospace">
              r = {sectorRadius}
            </text>
            <text x="120" y="75" fill="#fbbf24" fontSize="11" textAnchor="middle" fontFamily="monospace">
              θ = {sectorAngle}°
            </text>
          </svg>
        );
      case 'trapezoid':
        return (
          <svg className="w-full h-44" viewBox="0 0 220 180">
            <polygon points="65,55 155,55 185,135 35,135" fill="rgba(139, 92, 246, 0.15)" stroke="#8b5cf6" strokeWidth="2.5" />
            <line x1="65" y1="55" x2="65" y2="135" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="110" y="45" fill="#c4b5fd" fontSize="11" textAnchor="middle" fontFamily="monospace">
              b = {trapSmall}
            </text>
            <text x="110" y="153" fill="#c4b5fd" fontSize="11" textAnchor="middle" fontFamily="monospace">
              B = {trapBig}
            </text>
            <text x="50" y="95" fill="#c4b5fd" fontSize="11" textAnchor="middle" fontFamily="monospace">
              h = {trapHeight}
            </text>
          </svg>
        );
      case 'rhombus':
        return (
          <svg className="w-full h-44" viewBox="0 0 220 180">
            <polygon points="110,30 185,90 110,150 35,90" fill="rgba(236, 72, 153, 0.15)" stroke="#ec4899" strokeWidth="2.5" />
            <line x1="110" y1="30" x2="110" y2="150" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="35" y1="90" x2="185" y2="90" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="118" y="85" fill="#fbcfe8" fontSize="10" fontFamily="monospace">
              D = {rhombusD}
            </text>
            <text x="95" y="95" fill="#fbcfe8" fontSize="10" textAnchor="end" fontFamily="monospace">
              d = {rhombusd}
            </text>
          </svg>
        );
      case 'regular_polygon':
        return (
          <svg className="w-full h-44" viewBox="0 0 220 180">
            <circle cx="110" cy="90" r="55" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
            {/* Hexagon or n-gon representation */}
            <polygon
              points={Array.from({ length: polySides }, (_, i) => {
                const angle = (i * 2 * Math.PI) / polySides - Math.PI / 2;
                return `${110 + 55 * Math.cos(angle)},${90 + 55 * Math.sin(angle)}`;
              }).join(' ')}
              fill="rgba(6, 182, 212, 0.15)"
              stroke="#06b6d4"
              strokeWidth="2.5"
            />
            <text x="110" y="94" fill="#a5f3fc" fontSize="11" textAnchor="middle" fontFamily="monospace">
              {polySides} lados
            </text>
          </svg>
        );
    }
  };

  const shapesList = [
    { id: 'circle', label: 'Círculo' },
    { id: 'square', label: 'Quadrado' },
    { id: 'rectangle', label: 'Retângulo' },
    { id: 'triangle', label: 'Triângulo' },
    { id: 'sector', label: 'Setor Circular' },
    { id: 'trapezoid', label: 'Trapézio' },
    { id: 'rhombus', label: 'Losango' },
    { id: 'regular_polygon', label: 'Polígono Regular' },
  ];

  return (
    <div className="space-y-6">
      {/* Shapes list selector */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
        {shapesList.map((item) => (
          <button
            key={item.id}
            onClick={() => { setShape(item.id as typeof shape); setPyOutput(null); playClickSound(); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              shape === item.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Shapes className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Dimensões da Figura</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Geometria Euclidiana 2D</span>
          </div>

          {/* Dynamic input fields based on shape */}
          {shape === 'square' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Lado do Quadrado (L)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={squareSide}
                onChange={(e) => setSquareSide(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {shape === 'rectangle' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Base (b)</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={rectBase}
                  onChange={(e) => setRectBase(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Altura (h)</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={rectHeight}
                  onChange={(e) => setRectHeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {shape === 'triangle' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-400 block">Comprimento dos 3 lados (Fórmula de Heron):</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Lado a</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={triA}
                    onChange={(e) => setTriA(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Lado b</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={triB}
                    onChange={(e) => setTriB(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Lado c</label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    value={triC}
                    onChange={(e) => setTriC(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {shape === 'circle' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Raio do Círculo (r)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={circleRadius}
                onChange={(e) => setCircleRadius(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {shape === 'sector' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Raio (r)</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={sectorRadius}
                  onChange={(e) => setSectorRadius(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Ângulo Central (graus °)</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  max="360"
                  value={sectorAngle}
                  onChange={(e) => setSectorAngle(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {shape === 'trapezoid' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Base Maior (B)</label>
                  <input
                    type="number"
                    step="any"
                    value={trapBig}
                    onChange={(e) => setTrapBig(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Base Menor (b)</label>
                  <input
                    type="number"
                    step="any"
                    value={trapSmall}
                    onChange={(e) => setTrapSmall(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Altura (h)</label>
                  <input
                    type="number"
                    step="any"
                    value={trapHeight}
                    onChange={(e) => setTrapHeight(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Lado Oblíquo 1</label>
                  <input
                    type="number"
                    step="any"
                    value={trapSide1}
                    onChange={(e) => setTrapSide1(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Lado Oblíquo 2</label>
                  <input
                    type="number"
                    step="any"
                    value={trapSide2}
                    onChange={(e) => setTrapSide2(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {shape === 'rhombus' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Diagonal Maior (D)</label>
                <input
                  type="number"
                  step="any"
                  value={rhombusD}
                  onChange={(e) => setRhombusD(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Diagonal Menor (d)</label>
                <input
                  type="number"
                  step="any"
                  value={rhombusd}
                  onChange={(e) => setRhombusd(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {shape === 'regular_polygon' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Número de Lados (n)</label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={polySides}
                  onChange={(e) => setPolySides(parseInt(e.target.value) || 3)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Comprimento do Lado (L)</label>
                <input
                  type="number"
                  step="any"
                  value={polySideLength}
                  onChange={(e) => setPolySideLength(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* 2D Interactive SVG View */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-1">
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <Eye className="w-3 h-3 text-blue-400" />
                Diagrama Geométrico Vetorial
              </span>
              <span className="text-[10px] font-mono text-slate-600">SVG Render</span>
            </div>
            {renderSVGDiagram()}
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
              Fórmulas Exatas
            </span>
          </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main calculated results */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-blue-900/40 rounded-2xl p-5">
              <span className="text-xs uppercase font-mono tracking-wider text-blue-400 font-semibold block mb-1">
                Área Superficial (A)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                {result.area.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">unidades²</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-900/40 rounded-2xl p-5">
              <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-semibold block mb-1">
                Perímetro / Comprimento (P)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                {result.perimeter.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">unidades lineares</span>
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

          {/* Python code */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-bold text-white font-mono">Código Python 3 (math)</h4>
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
