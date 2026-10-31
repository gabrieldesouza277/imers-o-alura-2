/**
 * In-browser Python-compatible math runner & simulation engine.
 * Emulates standard Python 3 `math` module, arithmetic, variables, and `print()` execution.
 */

export interface PythonExecutionResult {
  success: boolean;
  output: string;
  returnValue?: unknown;
  error?: string;
  executionTimeMs: number;
}

export function executePythonCode(code: string): PythonExecutionResult {
  const startTime = performance.now();
  const logs: string[] = [];

  try {
    // Build a sandbox environment with math namespace
    const mathEnv: Record<string, unknown> = {
      pi: Math.PI,
      e: Math.E,
      tau: Math.PI * 2,
      sqrt: Math.sqrt,
      sin: (x: number) => Math.sin(x),
      cos: (x: number) => Math.cos(x),
      tan: (x: number) => Math.tan(x),
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      atan2: Math.atan2,
      hypot: Math.hypot,
      exp: Math.exp,
      log: Math.log,
      log10: Math.log10,
      log2: Math.log2,
      pow: Math.pow,
      floor: Math.floor,
      ceil: Math.ceil,
      radians: (deg: number) => (deg * Math.PI) / 180,
      degrees: (rad: number) => (rad * 180) / Math.PI,
      factorial: (n: number) => {
        if (n < 0) throw new Error('factorial() not defined for negative values');
        let r = 1;
        for (let i = 2; i <= n; i++) r *= i;
        return r;
      },
      comb: (n: number, k: number) => {
        if (k < 0 || k > n) return 0;
        let r = 1;
        for (let i = 1; i <= k; i++) {
          r = (r * (n - i + 1)) / i;
        }
        return Math.round(r);
      },
      perm: (n: number, k?: number) => {
        const p = k === undefined ? n : k;
        if (p < 0 || p > n) return 0;
        let r = 1;
        for (let i = 0; i < p; i++) {
          r *= (n - i);
        }
        return r;
      },
      gcd: (a: number, b: number) => {
        let x = Math.abs(a);
        let y = Math.abs(b);
        while (y) {
          const t = y;
          y = x % y;
          x = t;
        }
        return x;
      },
    };

    // Transform Python code line by line to safe executable JS
    const lines = code.split('\n');
    const transformedLines: string[] = [];

    // Simple custom print interceptor
    const customPrint = (...args: unknown[]) => {
      logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
    };

    for (const rawLine of lines) {
      let line = rawLine;

      // Handle comments
      const commentIdx = line.indexOf('#');
      if (commentIdx !== -1) {
        line = line.substring(0, commentIdx);
      }
      line = line.trim();
      if (!line) continue;

      // Ignore standard imports like `import math` or `from scipy import ...`
      if (line.startsWith('import ') || line.startsWith('from ')) {
        continue;
      }

      // Convert print(f"...") to JS template strings
      if (line.startsWith('print(') && line.endsWith(')')) {
        let inside = line.slice(6, -1);
        if (inside.startsWith('f"') || inside.startsWith("f'")) {
          // Replace {var:.2f} or {expr} with standard JS interpolation
          let template = inside.slice(2, -1);
          template = template.replace(/\{([^}]+)\}/g, (_, expression: string) => {
            const formatMatch = expression.match(/^(.+?):\.(\d+)f$/);
            if (formatMatch) {
              return `\${Number(${formatMatch[1]}).toFixed(${formatMatch[2]})}`;
            }
            const gMatch = expression.match(/^(.+?):g$/);
            if (gMatch) {
              return `\${Number(${gMatch[1]})}`;
            }
            return `\${${expression}}`;
          });
          transformedLines.push(`__print(\`${template}\`);`);
        } else {
          transformedLines.push(`__print(${inside});`);
        }
        continue;
      }

      // Convert Python power operator ** to Math.pow or JS **
      // JS supports ** directly in ES2016+
      
      // Convert Python True / False / None
      line = line.replace(/\bTrue\b/g, 'true')
                 .replace(/\bFalse\b/g, 'false')
                 .replace(/\bNone\b/g, 'null');

      // Convert simple list sum: sum(...)
      line = line.replace(/\bsum\(([^)]+)\)/g, 'Array.from($1).reduce((acc, curr) => acc + curr, 0)');

      // If line is an assignment without keyword, declare it in scope
      const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignMatch && !line.includes('==') && !line.includes('if ') && !line.includes('for ')) {
        const varName = assignMatch[1];
        const expr = assignMatch[2];
        transformedLines.push(`var ${varName} = ${expr};`);
        continue;
      }

      transformedLines.push(line);
    }

    const scriptBody = `
      "use strict";
      const math = __math;
      ${transformedLines.join('\n')}
    `;

    const runner = new Function('__print', '__math', scriptBody);
    runner(customPrint, mathEnv);

    const execTime = performance.now() - startTime;
    return {
      success: true,
      output: logs.length > 0 ? logs.join('\n') : '(Código executado com sucesso sem saída print)',
      executionTimeMs: Math.round(execTime * 100) / 100,
    };
  } catch (err: unknown) {
    const execTime = performance.now() - startTime;
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      output: logs.join('\n'),
      error: `Erro de Execução Python: ${msg}`,
      executionTimeMs: Math.round(execTime * 100) / 100,
    };
  }
}

export function downloadPythonScript(filename: string, code: string) {
  const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.py') ? filename : `${filename}.py`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
