import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  HelpCircle, 
  Copy, 
  Check, 
  Play, 
  Coins, 
  Rotate3d, 
  Layers 
} from 'lucide-react';
import { 
  calcCube, 
  calcCuboid, 
  calcCylinder, 
  calcSphere, 
  calcCone, 
  calcPyramid, 
  calcFrustumCone 
} from '../utils/mathFormulas';
import { executePythonCode } from '../utils/pythonEngine';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { CalculationHistoryItem, SpatialGeometryResult } from '../types/math';

interface SpatialGeometryProps {
  onAddToHistory: (item: Omit<CalculationHistoryItem, 'id' | 'timestamp'>) => void;
}

export const SpatialGeometryModule: React.FC<SpatialGeometryProps> = ({ onAddToHistory }) => {
  const [shape, setShape] = useState<'cube' | 'cuboid' | 'cylinder' | 'sphere' | 'cone' | 'pyramid' | 'frustum_cone'>('cylinder');

  // Cube
  const [cubeEdge, setCubeEdge] = useState<number>(5);

  // Cuboid
  const [cubLength, setCubLength] = useState<number>(6);
  const [cubWidth, setCubWidth] = useState<number>(4);
  const [cubHeight, setCubHeight] = useState<number>(8);

  // Cylinder
  const [cylRadius, setCylRadius] = useState<number>(4);
  const [cylHeight, setCylHeight] = useState<number>(10);

  // Sphere
  const [sphRadius, setSphRadius] = useState<number>(5);

  // Cone
  const [coneRadius, setConeRadius] = useState<number>(4);
  const [coneHeight, setConeHeight] = useState<number>(9);

  // Pyramid
  const [pyrBase, setPyrBase] = useState<number>(6);
  const [pyrHeight, setPyrHeight] = useState<number>(8);

  // Frustum Cone
  const [frustBigR, setFrustBigR] = useState<number>(6);
  const [frustSmallR, setFrustSmallR] = useState<number>(3);
  const [frustHeight, setFrustHeight] = useState<number>(7);

  const [copied, setCopied] = useState<boolean>(false);
  const [pyOutput, setPyOutput] = useState<string | null>(null);

  // Canvas 3D Rotation State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotX, setRotX] = useState<number>(0.4);
  const [rotY, setRotY] = useState<number>(0.6);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const getResult = (): SpatialGeometryResult => {
    try {
      switch (shape) {
        case 'cube':
          return calcCube(cubeEdge);
        case 'cuboid':
          return calcCuboid(cubLength, cubWidth, cubHeight);
        case 'cylinder':
          return calcCylinder(cylRadius, cylHeight);
        case 'sphere':
          return calcSphere(sphRadius);
        case 'cone':
          return calcCone(coneRadius, coneHeight);
        case 'pyramid':
          return calcPyramid(pyrBase, pyrHeight);
        case 'frustum_cone':
          return calcFrustumCone(frustBigR, frustSmallR, frustHeight);
      }
    } catch (e: unknown) {
      return {
        shape,
        baseArea: 0,
        lateralArea: 0,
        totalArea: 0,
        volume: 0,
        steps: [e instanceof Error ? e.message : 'Erro nos valores'],
        pythonCode: '# Erro',
      };
    }
  };

  const result = getResult();

  // Draw 3D wireframe on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Center
    const cx = width / 2;
    const cy = height / 2;
    const scale = 55;

    // Helper: 3D point rotation
    const project = (x: number, y: number, z: number) => {
      // Rotate around X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;

      // Rotate around Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;

      // Perspective projection
      const distance = 4;
      const p = distance / (distance + z2 * 0.4);

      return {
        x: cx + x2 * scale * p,
        y: cy - y1 * scale * p,
      };
    };

    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawLine = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    };

    if (shape === 'cube') {
      const s = 1.0;
      const vertices = [
        [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
        [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
      ].map(([x, y, z]) => project(x, y, z));

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];
      edges.forEach(([i, j]) => drawLine(vertices[i], vertices[j]));
    } else if (shape === 'cuboid') {
      const lx = 1.3;
      const wy = 0.8;
      const hz = 1.1;
      const vertices = [
        [-lx, -wy, -hz], [lx, -wy, -hz], [lx, wy, -hz], [-lx, wy, -hz],
        [-lx, -wy, hz], [lx, -wy, hz], [lx, wy, hz], [-lx, wy, hz],
      ].map(([x, y, z]) => project(x, y, z));

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];
      edges.forEach(([i, j]) => drawLine(vertices[i], vertices[j]));
    } else if (shape === 'cylinder') {
      const r = 1.0;
      const h = 1.3;
      const steps = 18;
      const topPts: { x: number; y: number }[] = [];
      const botPts: { x: number; y: number }[] = [];

      for (let i = 0; i < steps; i++) {
        const theta = (i * 2 * Math.PI) / steps;
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        topPts.push(project(x, h, z));
        botPts.push(project(x, -h, z));
      }

      ctx.beginPath();
      for (let i = 0; i < steps; i++) {
        const next = (i + 1) % steps;
        drawLine(topPts[i], topPts[next]);
        drawLine(botPts[i], botPts[next]);
        if (i % 3 === 0) drawLine(topPts[i], botPts[i]);
      }
    } else if (shape === 'sphere') {
      const r = 1.2;
      const rings = 8;
      const segs = 14;

      for (let i = 1; i < rings; i++) {
        const phi = (i * Math.PI) / rings;
        const y = r * Math.cos(phi);
        const ringR = r * Math.sin(phi);

        const pts: { x: number; y: number }[] = [];
        for (let j = 0; j < segs; j++) {
          const theta = (j * 2 * Math.PI) / segs;
          pts.push(project(ringR * Math.cos(theta), y, ringR * Math.sin(theta)));
        }
        for (let j = 0; j < segs; j++) {
          drawLine(pts[j], pts[(j + 1) % segs]);
        }
      }
    } else if (shape === 'cone') {
      const r = 1.1;
      const h = 1.4;
      const apex = project(0, h, 0);
      const steps = 16;
      const basePts: { x: number; y: number }[] = [];

      for (let i = 0; i < steps; i++) {
        const theta = (i * 2 * Math.PI) / steps;
        basePts.push(project(r * Math.cos(theta), -h, r * Math.sin(theta)));
      }

      for (let i = 0; i < steps; i++) {
        drawLine(basePts[i], basePts[(i + 1) % steps]);
        if (i % 2 === 0) drawLine(apex, basePts[i]);
      }
    } else if (shape === 'pyramid') {
      const s = 1.1;
      const h = 1.4;
      const apex = project(0, h, 0);
      const base = [
        [-s, -h, -s], [s, -h, -s], [s, -h, s], [-s, -h, s]
      ].map(([x, y, z]) => project(x, y, z));

      for (let i = 0; i < 4; i++) {
        drawLine(base[i], base[(i + 1) % 4]);
        drawLine(apex, base[i]);
      }
    } else if (shape === 'frustum_cone') {
      const r1 = 1.2;
      const r2 = 0.6;
      const h = 1.1;
      const steps = 16;
      const botPts: { x: number; y: number }[] = [];
      const topPts: { x: number; y: number }[] = [];

      for (let i = 0; i < steps; i++) {
        const theta = (i * 2 * Math.PI) / steps;
        botPts.push(project(r1 * Math.cos(theta), -h, r1 * Math.sin(theta)));
        topPts.push(project(r2 * Math.cos(theta), h, r2 * Math.sin(theta)));
      }

      for (let i = 0; i < steps; i++) {
        const next = (i + 1) % steps;
        drawLine(botPts[i], botPts[next]);
        drawLine(topPts[i], topPts[next]);
        if (i % 2 === 0) drawLine(botPts[i], topPts[i]);
      }
    }
  }, [shape, rotX, rotY]);

  // Handle Canvas mouse drag to rotate 3D solid
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => prev + dx * 0.012);
    setRotX((prev) => prev + dy * 0.012);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

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
    const names: Record<string, string> = {
      cube: 'Cubo',
      cuboid: 'Paralelepípedo',
      cylinder: 'Cilindro',
      sphere: 'Esfera',
      cone: 'Cone',
      pyramid: 'Pirâmide',
      frustum_cone: 'Tronco de Cone',
    };

    onAddToHistory({
      category: 'Geometria Espacial',
      title: `${names[shape]} (Volume = ${result.volume.toFixed(2)})`,
      expression: `Volume = ${result.volume.toFixed(4)}, Área Total = ${result.totalArea.toFixed(4)}`,
      result: `V = ${result.volume.toFixed(2)} | A_tot = ${result.totalArea.toFixed(2)}`,
      steps: result.steps,
      pythonCode: result.pythonCode,
    });
  };

  const shapesList = [
    { id: 'cylinder', label: 'Cilindro' },
    { id: 'cube', label: 'Cubo' },
    { id: 'cuboid', label: 'Paralelepípedo' },
    { id: 'sphere', label: 'Esfera' },
    { id: 'cone', label: 'Cone' },
    { id: 'pyramid', label: 'Pirâmide' },
    { id: 'frustum_cone', label: 'Tronco de Cone' },
  ];

  return (
    <div className="space-y-6">
      {/* Subtab selection */}
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
              <Box className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Dimensões do Sólido 3D</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">Volume & Áreas</span>
          </div>

          {/* Dynamic input fields */}
          {shape === 'cube' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Aresta do Cubo (a)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={cubeEdge}
                onChange={(e) => setCubeEdge(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {shape === 'cuboid' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Comprimento (a)</label>
                <input
                  type="number"
                  step="any"
                  value={cubLength}
                  onChange={(e) => setCubLength(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Largura (b)</label>
                <input
                  type="number"
                  step="any"
                  value={cubWidth}
                  onChange={(e) => setCubWidth(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Altura (c)</label>
                <input
                  type="number"
                  step="any"
                  value={cubHeight}
                  onChange={(e) => setCubHeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {shape === 'cylinder' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Raio da Base (r)</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={cylRadius}
                  onChange={(e) => setCylRadius(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Altura (h)</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={cylHeight}
                  onChange={(e) => setCylHeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {shape === 'sphere' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Raio da Esfera (r)</label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={sphRadius}
                onChange={(e) => setSphRadius(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {shape === 'cone' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Raio da Base (r)</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={coneRadius}
                  onChange={(e) => setConeRadius(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Altura (h)</label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={coneHeight}
                  onChange={(e) => setConeHeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {shape === 'pyramid' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Lado da Base Quadrada (L)</label>
                <input
                  type="number"
                  step="any"
                  value={pyrBase}
                  onChange={(e) => setPyrBase(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Altura da Pirâmide (h)</label>
                <input
                  type="number"
                  step="any"
                  value={pyrHeight}
                  onChange={(e) => setPyrHeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {shape === 'frustum_cone' && (
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Raio Maior (R)</label>
                <input
                  type="number"
                  step="any"
                  value={frustBigR}
                  onChange={(e) => setFrustBigR(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Raio Menor (r)</label>
                <input
                  type="number"
                  step="any"
                  value={frustSmallR}
                  onChange={(e) => setFrustSmallR(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Altura (h)</label>
                <input
                  type="number"
                  step="any"
                  value={frustHeight}
                  onChange={(e) => setFrustHeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* 3D Interactive Canvas */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                <Rotate3d className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '10s' }} />
                Visualizador 3D Interativo (Arraste para Girar)
              </span>
              <span className="text-[10px] font-mono text-slate-600">Canvas 3D Wireframe</span>
            </div>

            <canvas
              ref={canvasRef}
              width={340}
              height={190}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-grab active:cursor-grabbing w-full max-w-[340px] h-[190px] rounded-lg bg-slate-900/40"
            />
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
              Volume & Teorema de Cavalieri
            </span>
          </div>
        </div>

        {/* Right Details */}
        <div className="lg:col-span-6 space-y-6">
          {/* Main calculated results */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-purple-900/40 rounded-2xl p-5">
              <span className="text-xs uppercase font-mono tracking-wider text-purple-400 font-semibold block mb-1">
                Volume Total (V)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                {result.volume.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">unidades³ (m³, L)</span>
            </div>

            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 border border-blue-900/40 rounded-2xl p-5">
              <span className="text-xs uppercase font-mono tracking-wider text-blue-400 font-semibold block mb-1">
                Área Total da Superfície (A_t)
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                {result.totalArea.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Base: {result.baseArea.toFixed(2)} | Lateral: {result.lateralArea.toFixed(2)}
              </span>
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
                  <span className="text-purple-400 font-semibold select-none">{idx + 1}.</span>
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
                <h4 className="text-xs font-bold text-white font-mono">Script Python 3 (math.pi)</h4>
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
