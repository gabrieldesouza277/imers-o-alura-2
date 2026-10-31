import React, { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { 
  Rocket, 
  RotateCcw, 
  Flame, 
  X, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Orbit
} from 'lucide-react';
import { playAntigravityWhoosh, playBounceSound, playClickSound, setAudioMuted, getAudioMuted } from '../utils/audio';

interface AntigravityProps {
  onClose: () => void;
  activeFormulaCode?: string;
}

export const AntigravityMode: React.FC<AntigravityProps> = ({ onClose, activeFormulaCode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  const [gravityMode, setGravityMode] = useState<'zero' | 'earth' | 'inverted' | 'moon'>('zero');
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [isMuted, setIsMuted] = useState<boolean>(getAudioMuted());
  const [elementsCount, setElementsCount] = useState<number>(0);

  // Initialize Matter.js simulation
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    playAntigravityWhoosh();

    const {
      Engine,
      Render,
      Runner,
      Bodies,
      Composite,
      Mouse,
      MouseConstraint,
      Events,
      Body,
    } = Matter;

    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Create engine
    const engine = Engine.create({
      gravity: { x: 0, y: 0, scale: 0.001 },
    });
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#070b14',
        showVelocity: false,
      },
    });
    renderRef.current = render;

    // Static Boundaries (Walls, Floor, Ceiling)
    const wallThickness = 80;
    const ground = Bodies.rectangle(width / 2, height + wallThickness / 2 - 5, width + 400, wallThickness, {
      isStatic: true,
      render: { fillStyle: '#1e293b' },
    });
    const ceiling = Bodies.rectangle(width / 2, -wallThickness / 2 + 5, width + 400, wallThickness, {
      isStatic: true,
      render: { fillStyle: '#1e293b' },
    });
    const leftWall = Bodies.rectangle(-wallThickness / 2 + 5, height / 2, wallThickness, height + 400, {
      isStatic: true,
      render: { fillStyle: '#1e293b' },
    });
    const rightWall = Bodies.rectangle(width + wallThickness / 2 - 5, height / 2, wallThickness, height + 400, {
      isStatic: true,
      render: { fillStyle: '#1e293b' },
    });

    Composite.add(engine.world, [ground, ceiling, leftWall, rightWall]);

    // Generate themed mathematical elements
    const mathChips = [
      { text: 'E = d / D', color: '#3b82f6', category: 'Escala' },
      { text: 'P(A|B)', color: '#8b5cf6', category: 'Bayes' },
      { text: 'C(n, p)', color: '#ec4899', category: 'Combinatória' },
      { text: 'A = π · r²', color: '#10b981', category: 'Círculo' },
      { text: 'V = (4/3)πr³', color: '#06b6d4', category: 'Esfera' },
      { text: 'J = C · i · t', color: '#f59e0b', category: 'Porcentagem' },
      { text: 'X = (b1 · a2) / a1', color: '#14b8a6', category: 'Regra de 3' },
      { text: 'd = √(a²+b²+c²)', color: '#6366f1', category: 'Espacial' },
      { text: 'import math', color: '#38bdf8', category: 'Python' },
      { text: 'math.comb(10, 3)', color: '#a855f7', category: 'Python' },
      { text: 'def regra_de_tres():', color: '#22c55e', category: 'Python' },
      { text: '7', color: '#334155', category: 'num' },
      { text: '8', color: '#334155', category: 'num' },
      { text: '9', color: '#334155', category: 'num' },
      { text: '÷', color: '#f97316', category: 'op' },
      { text: '4', color: '#334155', category: 'num' },
      { text: '5', color: '#334155', category: 'num' },
      { text: '6', color: '#334155', category: 'num' },
      { text: '×', color: '#f97316', category: 'op' },
      { text: '1', color: '#334155', category: 'num' },
      { text: '2', color: '#334155', category: 'num' },
      { text: '3', color: '#334155', category: 'num' },
      { text: '-', color: '#f97316', category: 'op' },
      { text: '0', color: '#334155', category: 'num' },
      { text: '.', color: '#334155', category: 'num' },
      { text: '=', color: '#3b82f6', category: 'op' },
      { text: '+', color: '#f97316', category: 'op' },
      { text: '√x', color: '#64748b', category: 'func' },
      { text: 'x²', color: '#64748b', category: 'func' },
      { text: 'π', color: '#64748b', category: 'func' },
      { text: '%', color: '#64748b', category: 'func' },
    ];

    const bodies: Matter.Body[] = [];

    mathChips.forEach((chip, i) => {
      const isNum = chip.category === 'num' || chip.category === 'op' || chip.category === 'func';
      const bWidth = isNum ? 64 : Math.max(110, chip.text.length * 11 + 24);
      const bHeight = isNum ? 52 : 46;

      // Position clustered slightly towards center-top, then drifting
      const startX = width * 0.15 + (i % 6) * (width * 0.13) + (Math.random() * 40 - 20);
      const startY = height * 0.18 + Math.floor(i / 6) * 65 + (Math.random() * 30 - 15);

      const body = Bodies.rectangle(startX, startY, bWidth, bHeight, {
        chamfer: { radius: 10 },
        restitution: 0.85,
        friction: 0.05,
        frictionAir: 0.015,
        render: {
          fillStyle: chip.color,
          strokeStyle: '#ffffff22',
          lineWidth: 1.5,
        },
      });

      // Custom properties for drawing custom text and labels on bodies
      (body as unknown as { customLabel: string; customCategory: string }).customLabel = chip.text;
      (body as unknown as { customCategory: string }).customCategory = chip.category;

      // Small initial zero-g float velocity
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 2.5,
        y: (Math.random() - 0.5) * 2.5,
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.04);

      bodies.push(body);
    });

    Composite.add(engine.world, bodies);
    setElementsCount(bodies.length);

    // Mouse control for dragging & tossing
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: true,
          lineWidth: 2,
          strokeStyle: '#60a5fa88',
        },
      },
    });

    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Collision sound & interactive clicking
    Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const speedA = pair.bodyA.speed || 0;
        const speedB = pair.bodyB.speed || 0;
        const maxSpeed = Math.max(speedA, speedB);
        if (maxSpeed > 2.5) {
          playBounceSound(maxSpeed);
        }
      });
    });

    // Handle clicks on calculator buttons inside Antigravity
    Events.on(mouseConstraint, 'mousedown', () => {
      if (mouseConstraint.body) {
        const bodyWithLabel = mouseConstraint.body as unknown as { customLabel?: string; customCategory?: string };
        if (bodyWithLabel.customLabel) {
          playClickSound(520);
          handleAntigravityKeyPress(bodyWithLabel.customLabel);
        }
      }
    });

    // Custom Canvas Render for Text Labels inside Matter.js bodies
    Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      const allBodies = Composite.allBodies(engine.world);

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      allBodies.forEach((b) => {
        const info = b as unknown as { customLabel?: string; customCategory?: string };
        if (info.customLabel) {
          ctx.save();
          ctx.translate(b.position.x, b.position.y);
          ctx.rotate(b.angle);

          const isOpOrNum = info.customCategory === 'num' || info.customCategory === 'op' || info.customCategory === 'func';
          ctx.font = isOpOrNum 
            ? 'bold 18px "Fira Code", monospace' 
            : '600 13px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
          ctx.shadowBlur = 4;
          ctx.fillText(info.customLabel, 0, 0);

          ctx.restore();
        }
      });

      ctx.restore();
    });

    // Start runner and renderer
    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);
    Render.run(render);

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !renderRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      renderRef.current.options.width = newW;
      renderRef.current.options.height = newH;
      renderRef.current.canvas.width = newW;
      renderRef.current.canvas.height = newH;

      Matter.Body.setPosition(ground, { x: newW / 2, y: newH + wallThickness / 2 - 5 });
      Matter.Body.setPosition(ceiling, { x: newW / 2, y: -wallThickness / 2 + 5 });
      Matter.Body.setPosition(rightWall, { x: newW + wallThickness / 2 - 5, y: newH / 2 });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, []);

  // Handle calculator clicks within Antigravity
  const handleAntigravityKeyPress = (val: string) => {
    setCalcDisplay((prev) => {
      if (val === '=') {
        try {
          // Replace operators with JS syntax
          const sanitized = prev
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/π/g, 'Math.PI')
            .replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');
          
          // Safe evaluation of simple math expressions
          const evaluated = new Function(`return (${sanitized});`)();
          return String(Math.round(evaluated * 10000) / 10000);
        } catch {
          return 'Erro';
        }
      }
      if (val === '√x') {
        try {
          const num = parseFloat(prev);
          return isNaN(num) ? 'Erro' : String(Math.sqrt(num));
        } catch {
          return 'Erro';
        }
      }
      if (val === 'x²') {
        try {
          const num = parseFloat(prev);
          return isNaN(num) ? 'Erro' : String(num * num);
        } catch {
          return 'Erro';
        }
      }
      if (prev === '0' || prev === 'Erro') {
        return val;
      }
      return prev + val;
    });
  };

  // Change Gravity setting
  const setGravity = (mode: 'zero' | 'earth' | 'inverted' | 'moon') => {
    if (!engineRef.current) return;
    setGravityMode(mode);
    playClickSound(600);

    const engine = engineRef.current;
    if (mode === 'zero') {
      engine.gravity.y = 0;
      engine.gravity.x = 0;
    } else if (mode === 'earth') {
      engine.gravity.y = 1;
      engine.gravity.x = 0;
    } else if (mode === 'inverted') {
      engine.gravity.y = -1;
      engine.gravity.x = 0;
    } else if (mode === 'moon') {
      engine.gravity.y = 0.16;
      engine.gravity.x = 0;
    }
  };

  // Shockwave impulse / explosion effect
  const triggerImpulse = () => {
    if (!engineRef.current || !containerRef.current) return;
    playAntigravityWhoosh();

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const allBodies = Matter.Composite.allBodies(engineRef.current.world);
    allBodies.forEach((b) => {
      if (!b.isStatic) {
        const dx = b.position.x - centerX;
        const dy = b.position.y - centerY;
        const dist = Math.max(20, Math.hypot(dx, dy));
        const forceMagnitude = 0.06;

        Matter.Body.applyForce(b, b.position, {
          x: (dx / dist) * forceMagnitude * (Math.random() * 0.8 + 0.6),
          y: (dy / dist) * forceMagnitude * (Math.random() * 0.8 + 0.6),
        });
      }
    });
  };

  // Spawn additional formula body
  const spawnNewMathBody = () => {
    if (!engineRef.current || !containerRef.current) return;
    playClickSound(700);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const extraPhrases = [
      'f(x) = x³ - 2x',
      'lim_{x→0} sin(x)/x = 1',
      'P = 2πr',
      'V = (π·h/3)(R²+Rr+r²)',
      'math.factorial(8)',
      '1:25.000',
      'P(X ≤ k)',
      'ΔV / V₀ × 100%',
    ];
    const picked = extraPhrases[Math.floor(Math.random() * extraPhrases.length)];
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const bWidth = Math.max(120, picked.length * 11 + 24);
    const bHeight = 46;

    const newBody = Matter.Bodies.rectangle(
      width / 2 + (Math.random() * 100 - 50),
      height / 2 + (Math.random() * 100 - 50),
      bWidth,
      bHeight,
      {
        chamfer: { radius: 10 },
        restitution: 0.9,
        render: {
          fillStyle: color,
          strokeStyle: '#ffffff33',
          lineWidth: 2,
        },
      }
    );

    (newBody as unknown as { customLabel: string; customCategory: string }).customLabel = picked;
    (newBody as unknown as { customCategory: string }).customCategory = 'extra';

    Matter.Body.setVelocity(newBody, {
      x: (Math.random() - 0.5) * 6,
      y: (Math.random() - 0.5) * 6,
    });

    Matter.Composite.add(engineRef.current.world, newBody);
    setElementsCount((prev) => prev + 1);
  };

  // Reset positions
  const resetSimulation = () => {
    if (!engineRef.current || !containerRef.current) return;
    playClickSound(400);

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const allBodies = Matter.Composite.allBodies(engineRef.current.world);

    let idx = 0;
    allBodies.forEach((b) => {
      if (!b.isStatic) {
        const startX = width * 0.15 + (idx % 6) * (width * 0.13) + (Math.random() * 20 - 10);
        const startY = height * 0.2 + Math.floor(idx / 6) * 65 + (Math.random() * 20 - 10);
        Matter.Body.setPosition(b, { x: startX, y: startY });
        Matter.Body.setVelocity(b, { x: 0, y: 0 });
        Matter.Body.setAngle(b, 0);
        idx++;
      }
    });
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    setAudioMuted(next);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 select-none overflow-hidden"
    >
      {/* Physics Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Floating Control Bar */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
            <Orbit className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                Google Antigravity Math
              </h1>
              <span className="text-xs text-blue-400 font-mono">Matter.js v0.19</span>
            </div>
            <p className="text-xs text-slate-400">
              Arraste, arremesse e colida fórmulas e números matemáticos em Gravidade Zero!
            </p>
          </div>
        </div>

        {/* Gravity State Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => setGravity('zero')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gravityMode === 'zero'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Gravidade Zero (Espaço)"
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Gravidade Zero</span>
          </button>

          <button
            onClick={() => setGravity('earth')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gravityMode === 'earth'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Gravidade Terrestre (1G - Clássico Google Gravity)"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Gravidade 1G</span>
          </button>

          <button
            onClick={() => setGravity('inverted')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gravityMode === 'inverted'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Antigravidade Invertida (-1G)"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Invertida (-1G)</span>
          </button>

          <button
            onClick={() => setGravity('moon')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              gravityMode === 'moon'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Gravidade Lunar (0.16G)"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Lunar (0.16G)</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerImpulse}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30 transition-colors"
            title="Explosão / Pulso Gravitacional"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Pulso Radial</span>
          </button>

          <button
            onClick={spawnNewMathBody}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
            title="Adicionar mais fórmulas"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Bloco</span>
          </button>

          <button
            onClick={resetSimulation}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
            title="Reposicionar Blocos"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800 transition-colors"
            title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors ml-2"
          >
            <X className="w-3.5 h-3.5" />
            <span>Voltar à Calculadora</span>
          </button>
        </div>
      </header>

      {/* Floating HUD: Mini Interactive Display */}
      <div className="absolute bottom-6 right-6 z-20 w-72 bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800/80 shadow-2xl pointer-events-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Display Gravitacional</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {elementsCount} corpos ativos
          </span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 mb-3 text-right">
          <div className="text-xl font-mono font-bold text-blue-400 truncate">
            {calcDisplay}
          </div>
        </div>

        <div className="text-[11px] text-slate-400 leading-relaxed">
          <p>Dica: Clique ou colida botões numéricos na tela para montar equações, ou lance-os contra as paredes!</p>
        </div>

        {activeFormulaCode && (
          <div className="mt-3 pt-3 border-t border-slate-800/70">
            <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
              Fórmula Python Ativa
            </span>
            <div className="text-[11px] font-mono text-emerald-400 bg-slate-950/80 p-2 rounded-lg truncate">
              {activeFormulaCode.split('\n')[0] || 'math.sqrt(...) Ready'}
            </div>
          </div>
        )}
      </div>

      {/* Instructions Overlay Note */}
      <div className="absolute bottom-6 left-6 z-20 pointer-events-none hidden sm:block">
        <div className="bg-slate-900/70 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-slate-800/60 text-xs text-slate-400 space-y-1">
          <p className="font-medium text-slate-300">🕹️ Controles de Física:</p>
          <p>• Segure e arremesse qualquer cartão ou número</p>
          <p>• Alterne entre Gravidade 1G, Zero e Invertida</p>
          <p>• Pressione "Pulso Radial" para desencadear onda de choque</p>
        </div>
      </div>
    </div>
  );
};
