import {
  BinomialResult,
  CombinatoricsResult,
  CompoundRuleMagnitude,
  PercentageResult,
  PlaneGeometryResult,
  RuleOfThreeCompoundResult,
  RuleOfThreeSimpleResult,
  ScaleCalculationResult,
  SpatialGeometryResult,
  UnitLength,
} from '../types/math';

// Unit conversion to millimeters for scale calculations
export const UNIT_TO_MM: Record<UnitLength, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  km: 1000000,
};

export const UNIT_LABELS: Record<UnitLength, string> = {
  mm: 'milímetros (mm)',
  cm: 'centímetros (cm)',
  m: 'metros (m)',
  km: 'quilômetros (km)',
};

/**
 * =========================================================================
 * 1. PORCENTAGEM (PERCENTAGE)
 * =========================================================================
 */

export function calcPercentOf(percent: number, total: number): PercentageResult {
  const result = (percent / 100) * total;
  const steps = [
    `Fórmula: Valor = (Porcentagem / 100) × Total`,
    `Substituição: Valor = (${percent} / 100) × ${total}`,
    `Cálculo da fração decimal: ${percent / 100}`,
    `Multiplicação: ${percent / 100} × ${total} = ${result}`,
  ];

  const pythonCode = `# Cálculo de Porcentagem: ${percent}% de ${total}
percent = ${percent}
total = ${total}

resultado = (percent / 100) * total
print(f"{percent}% de {total} = {resultado}")
`;

  return {
    type: 'percent_of',
    value: result,
    steps,
    pythonCode,
  };
}

export function calcIsWhatPercent(part: number, total: number): PercentageResult {
  if (total === 0) throw new Error('O total não pode ser zero.');
  const result = (part / total) * 100;
  const steps = [
    `Fórmula: Porcentagem = (Parte / Total) × 100%`,
    `Substituição: Porcentagem = (${part} / ${total}) × 100%`,
    `Divisão: ${part} / ${total} = ${part / total}`,
    `Resultado em percentual: ${(part / total) * 100}%`,
  ];

  const pythonCode = `# Qual porcentagem ${part} representa de ${total}?
parte = ${part}
total = ${total}

percentual = (parte / total) * 100
print(f"{parte} representa {percentual:.2f}% de {total}")
`;

  return {
    type: 'is_what_percent',
    value: result,
    steps,
    pythonCode,
  };
}

export function calcPercentVariation(initialVal: number, finalVal: number): PercentageResult {
  if (initialVal === 0) throw new Error('O valor inicial não pode ser zero.');
  const diff = finalVal - initialVal;
  const variation = (diff / initialVal) * 100;
  const typeText = diff >= 0 ? 'Aumento percentual' : 'Redução percentual';

  const steps = [
    `Fórmula: Variação (%) = ((Valor Final - Valor Inicial) / Valor Inicial) × 100%`,
    `Diferença absoluta: ΔV = ${finalVal} - ${initialVal} = ${diff}`,
    `Razão: ${diff} / ${initialVal} = ${diff / initialVal}`,
    `${typeText}: ${variation > 0 ? '+' : ''}${variation.toFixed(2)}%`,
  ];

  const pythonCode = `# Variação Percentual de ${initialVal} para ${finalVal}
v_inicial = ${initialVal}
v_final = ${finalVal}

delta = v_final - v_inicial
variacao_pct = (delta / v_inicial) * 100
status = "Aumento" if delta >= 0 else "Redução"

print(f"{status} de {variacao_pct:.2f}%")
`;

  return {
    type: 'variation',
    value: variation,
    steps,
    pythonCode,
  };
}

export function calcIncreaseDecrease(baseVal: number, percent: number, isIncrease: boolean): PercentageResult {
  const factor = isIncrease ? 1 + percent / 100 : 1 - percent / 100;
  const result = baseVal * factor;
  const word = isIncrease ? 'acréscimo' : 'desconto';
  const sign = isIncrease ? '+' : '-';

  const steps = [
    `Fórmula: Valor Final = Valor Base × (1 ${sign} Taxa/100)`,
    `Fator multiplicador: 1 ${sign} (${percent} / 100) = ${factor}`,
    `Cálculo final: ${baseVal} × ${factor} = ${result}`,
    `Diferença monetária/numérica: ${Math.abs(result - baseVal)} (${word})`,
  ];

  const pythonCode = `# Aplicação de ${word} de ${percent}% sobre ${baseVal}
base = ${baseVal}
taxa_pct = ${percent}
is_aumento = ${isIncrease ? 'True' : 'False'}

fator = 1 + (taxa_pct / 100) if is_aumento else 1 - (taxa_pct / 100)
resultado = base * fator
print(f"Valor após ${word}: {resultado}")
`;

  return {
    type: 'increase_decrease',
    value: result,
    steps,
    pythonCode,
  };
}

export function calcSimpleInterest(capital: number, ratePercent: number, timePeriods: number): PercentageResult {
  const i = ratePercent / 100;
  const interest = capital * i * timePeriods;
  const totalAmount = capital + interest;

  const steps = [
    `Fórmula do Juro Simples: J = C × i × t`,
    `Taxa unitária: i = ${ratePercent}% / 100 = ${i}`,
    `Juros acumulados: J = ${capital} × ${i} × ${timePeriods} = ${interest}`,
    `Montante Final (M = C + J): ${capital} + ${interest} = ${totalAmount}`,
  ];

  const pythonCode = `# Juros Simples
capital = ${capital}
taxa = ${ratePercent} / 100
tempo = ${timePeriods}

juros = capital * taxa * tempo
montante = capital + juros

print(f"Juros: {juros:.2f}")
print(f"Montante Total: {montante:.2f}")
`;

  return {
    type: 'simple_interest',
    value: totalAmount,
    steps,
    pythonCode,
  };
}

export function calcCompoundInterest(capital: number, ratePercent: number, timePeriods: number): PercentageResult {
  const i = ratePercent / 100;
  const totalAmount = capital * Math.pow(1 + i, timePeriods);
  const interest = totalAmount - capital;

  const steps = [
    `Fórmula do Juro Composto: M = C × (1 + i)^t`,
    `Taxa unitária: i = ${ratePercent}% / 100 = ${i}`,
    `Fator de capitalização: (1 + ${i})^${timePeriods} = ${Math.pow(1 + i, timePeriods).toFixed(6)}`,
    `Montante Final: M = ${capital} × ${Math.pow(1 + i, timePeriods).toFixed(6)} = ${totalAmount.toFixed(2)}`,
    `Total de Juros gerados: M - C = ${totalAmount.toFixed(2)} - ${capital} = ${interest.toFixed(2)}`,
  ];

  const pythonCode = `# Juros Compostos
capital = ${capital}
taxa = ${ratePercent} / 100
tempo = ${timePeriods}

montante = capital * ((1 + taxa) ** tempo)
juros = montante - capital

print(f"Montante Total: {montante:.2f}")
print(f"Rendimento / Juros: {juros:.2f}")
`;

  return {
    type: 'compound_interest',
    value: totalAmount,
    steps,
    pythonCode,
  };
}

/**
 * =========================================================================
 * 2. ESCALA E CONVERSÕES (SCALE)
 * =========================================================================
 */

export function calculateScale(
  mode: 'find_real' | 'find_paper' | 'find_scale',
  paperVal: number,
  paperUnit: UnitLength,
  realVal: number,
  realUnit: UnitLength,
  scaleDenom: number
): ScaleCalculationResult {
  let finalPaperMm = 0;
  let finalRealMm = 0;
  let finalScaleRatio = scaleDenom;
  const steps: string[] = [];

  if (mode === 'find_real') {
    if (finalScaleRatio <= 0) throw new Error('A escala deve ser maior que zero.');
    finalPaperMm = paperVal * UNIT_TO_MM[paperUnit];
    finalRealMm = finalPaperMm * finalScaleRatio;
    const convertedReal = finalRealMm / UNIT_TO_MM[realUnit];

    steps.push(`Definição da escala 1:${finalScaleRatio}: cada 1 unidade no desenho equivale a ${finalScaleRatio} unidades no real.`);
    steps.push(`Conversão da medida do desenho (${paperVal} ${paperUnit}) para mm: ${finalPaperMm} mm.`);
    steps.push(`Aplicação da escala: Medida Real (mm) = ${finalPaperMm} × ${finalScaleRatio} = ${finalRealMm.toLocaleString()} mm.`);
    steps.push(`Conversão para a unidade desejada (${realUnit}): ${finalRealMm} / ${UNIT_TO_MM[realUnit]} = ${convertedReal.toLocaleString()} ${realUnit}.`);

    const pythonCode = `# Cálculo de Escala: Encontrar Medida Real
# Escala 1:${finalScaleRatio}
d_desenho = ${paperVal}  # ${paperUnit}
escala = ${finalScaleRatio}

# Fatores para milímetros
fator_papel = ${UNIT_TO_MM[paperUnit]}
fator_real = ${UNIT_TO_MM[realUnit]}

d_mm = d_desenho * fator_papel
real_mm = d_mm * escala
real_convertido = real_mm / fator_real

print(f"Medida Real: {real_convertido:g} ${realUnit}")
`;

    return {
      scaleRatio: finalScaleRatio,
      paperDistance: paperVal,
      paperUnit,
      realDistance: convertedReal,
      realUnit,
      scaleString: `1:${finalScaleRatio}`,
      areaScaleString: `1:${(finalScaleRatio * finalScaleRatio).toLocaleString()}`,
      volumeScaleString: `1:${Math.pow(finalScaleRatio, 3).toLocaleString()}`,
      steps,
      pythonCode,
    };
  } else if (mode === 'find_paper') {
    if (finalScaleRatio <= 0) throw new Error('A escala deve ser maior que zero.');
    finalRealMm = realVal * UNIT_TO_MM[realUnit];
    finalPaperMm = finalRealMm / finalScaleRatio;
    const convertedPaper = finalPaperMm / UNIT_TO_MM[paperUnit];

    steps.push(`Fórmula da Escala: E = d / D  =>  d = D / N`);
    steps.push(`Conversão da medida real (${realVal} ${realUnit}) para mm: ${finalRealMm.toLocaleString()} mm.`);
    steps.push(`Aplicação da escala 1:${finalScaleRatio}: d = ${finalRealMm} / ${finalScaleRatio} = ${finalPaperMm.toFixed(4)} mm.`);
    steps.push(`Conversão para a unidade do desenho (${paperUnit}): ${convertedPaper.toFixed(4)} ${paperUnit}.`);

    const pythonCode = `# Cálculo de Escala: Encontrar Medida no Desenho
# Escala 1:${finalScaleRatio}
d_real = ${realVal}  # ${realUnit}
escala = ${finalScaleRatio}

fator_real = ${UNIT_TO_MM[realUnit]}
fator_papel = ${UNIT_TO_MM[paperUnit]}

real_mm = d_real * fator_real
papel_mm = real_mm / escala
papel_convertido = papel_mm / fator_papel

print(f"Medida no Desenho: {papel_convertido:.4f} ${paperUnit}")
`;

    return {
      scaleRatio: finalScaleRatio,
      paperDistance: convertedPaper,
      paperUnit,
      realDistance: realVal,
      realUnit,
      scaleString: `1:${finalScaleRatio}`,
      areaScaleString: `1:${(finalScaleRatio * finalScaleRatio).toLocaleString()}`,
      volumeScaleString: `1:${Math.pow(finalScaleRatio, 3).toLocaleString()}`,
      steps,
      pythonCode,
    };
  } else {
    // find_scale
    finalPaperMm = paperVal * UNIT_TO_MM[paperUnit];
    finalRealMm = realVal * UNIT_TO_MM[realUnit];
    if (finalPaperMm <= 0) throw new Error('A medida do desenho deve ser maior que zero.');

    finalScaleRatio = Math.round((finalRealMm / finalPaperMm) * 1000) / 1000;

    steps.push(`Fórmula: Escala (E) = d (desenho) / D (real), ambas na mesma unidade.`);
    steps.push(`Medida do desenho: ${paperVal} ${paperUnit} = ${finalPaperMm} mm.`);
    steps.push(`Medida real: ${realVal} ${realUnit} = ${finalRealMm.toLocaleString()} mm.`);
    steps.push(`Razão: N = D / d = ${finalRealMm} / ${finalPaperMm} = ${finalScaleRatio}`);
    steps.push(`Escala obtida: 1 : ${finalScaleRatio}`);

    const pythonCode = `# Cálculo do Denominador da Escala (N em 1:N)
d_desenho = ${paperVal}  # ${paperUnit}
d_real = ${realVal}  # ${realUnit}

papel_mm = d_desenho * ${UNIT_TO_MM[paperUnit]}
real_mm = d_real * ${UNIT_TO_MM[realUnit]}

denominador_escala = real_mm / papel_mm
print(f"Escala Cartográfica/Técnica: 1:{denominador_escala:g}")
`;

    return {
      scaleRatio: finalScaleRatio,
      paperDistance: paperVal,
      paperUnit,
      realDistance: realVal,
      realUnit,
      scaleString: `1:${finalScaleRatio}`,
      areaScaleString: `1:${(finalScaleRatio * finalScaleRatio).toLocaleString()}`,
      volumeScaleString: `1:${Math.pow(finalScaleRatio, 3).toLocaleString()}`,
      steps,
      pythonCode,
    };
  }
}

/**
 * =========================================================================
 * 3. PROBABILIDADE E COMBINATÓRIA (PROBABILITY)
 * =========================================================================
 */

export function factorial(n: number): number {
  if (n < 0) throw new Error('Fatorial não é definido para números negativos.');
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

export function calcCombinatorics(
  type: 'factorial' | 'permutation' | 'arrangement' | 'combination',
  n: number,
  p = 0
): CombinatoricsResult {
  if (n < 0) throw new Error('n deve ser maior ou igual a zero.');
  if (type !== 'factorial' && p < 0) throw new Error('p deve ser maior ou igual a zero.');
  if ((type === 'arrangement' || type === 'combination') && p > n) {
    throw new Error('p não pode ser maior que n.');
  }

  let result = 0;
  let formula = '';
  const steps: string[] = [];
  let pythonCode = '';

  switch (type) {
    case 'factorial': {
      result = factorial(n);
      formula = `P_n = n!`;
      steps.push(`Fórmula: ${n}! = ${Array.from({ length: Math.min(n, 7) }, (_, i) => n - i).join(' × ')}${n > 7 ? ' ... × 1' : ''}`);
      steps.push(`Resultado: ${result.toLocaleString()}`);
      pythonCode = `import math\n\nn = ${n}\nresultado = math.factorial(n)\nprint(f"{n}! = {resultado}")\n`;
      break;
    }
    case 'permutation': {
      result = factorial(n);
      formula = `P(${n}) = ${n}!`;
      steps.push(`Permutação simples de ${n} elementos distintos.`);
      steps.push(`P(${n}) = ${n}! = ${result.toLocaleString()}`);
      pythonCode = `import math\n\nn = ${n}\nresultado = math.factorial(n)\nprint(f"Permutação P({n}) = {resultado}")\n`;
      break;
    }
    case 'arrangement': {
      result = factorial(n) / factorial(n - p);
      formula = `A(n, p) = n! / (n - p)!`;
      steps.push(`Arranjo simples de ${n} elementos tomados ${p} a ${p} (a ordem importa).`);
      steps.push(`A(${n}, ${p}) = ${n}! / (${n} - ${p})!`);
      steps.push(`A(${n}, ${p}) = ${n}! / ${n - p}! = ${result.toLocaleString()}`);
      pythonCode = `import math\n\nn = ${n}\np = ${p}\n\nresultado = math.perm(n, p)\nprint(f"Arranjo A({n}, {p}) = {resultado}")\n`;
      break;
    }
    case 'combination': {
      result = factorial(n) / (factorial(p) * factorial(n - p));
      formula = `C(n, p) = n! / [p! × (n - p)!]`;
      steps.push(`Combinação simples de ${n} elementos tomados ${p} a ${p} (a ordem NÃO importa).`);
      steps.push(`C(${n}, ${p}) = ${n}! / (${p}! × (${n} - ${p})!)`);
      steps.push(`C(${n}, ${p}) = ${result.toLocaleString()}`);
      pythonCode = `import math\n\nn = ${n}\np = ${p}\n\nresultado = math.comb(n, p)\nprint(f"Combinação C({n}, {p}) = {resultado}")\n`;
      break;
    }
  }

  return { n, p, result, formula, steps, pythonCode };
}

export function calcBinomial(n: number, p: number, k: number): BinomialResult {
  if (n < 0 || k < 0 || k > n) throw new Error('Parâmetros inválidos para Distribuição Binomial (0 <= k <= n).');
  if (p < 0 || p > 1) throw new Error('A probabilidade p de sucesso deve estar no intervalo [0, 1].');

  const q = 1 - p;
  const combNK = factorial(n) / (factorial(k) * factorial(n - k));
  const probExact = combNK * Math.pow(p, k) * Math.pow(q, n - k);

  // Compute distribution points
  const points: { k: number; prob: number; cumulative: number }[] = [];
  let cum = 0;
  let probAtMost = 0;
  let probAtLeast = 0;

  for (let i = 0; i <= n; i++) {
    const c = factorial(n) / (factorial(i) * factorial(n - i));
    const pr = c * Math.pow(p, i) * Math.pow(q, n - i);
    cum += pr;
    points.push({ k: i, prob: pr, cumulative: cum });

    if (i <= k) probAtMost += pr;
    if (i >= k) probAtLeast += pr;
  }

  const expectedValue = n * p;
  const variance = n * p * q;

  const steps = [
    `Fórmula Binomial: P(X = k) = C(n, k) × p^k × (1 - p)^(n - k)`,
    `Substituição: C(${n}, ${k}) × (${p})^${k} × (${q.toFixed(4)})^${n - k}`,
    `Combinação C(${n}, ${k}) = ${combNK}`,
    `Probabilidade exata P(X = ${k}) = ${(probExact * 100).toFixed(4)}% (${probExact.toFixed(6)})`,
    `Probabilidade acumulada P(X ≤ ${k}) = ${(probAtMost * 100).toFixed(4)}%`,
    `Probabilidade acumulada P(X ≥ ${k}) = ${(probAtLeast * 100).toFixed(4)}%`,
    `Valor Esperado (Média): E[X] = n × p = ${expectedValue.toFixed(2)} sucessos`,
    `Variância: Var(X) = n × p × (1 - p) = ${variance.toFixed(4)}`,
  ];

  const pythonCode = `import math
from scipy import stats  # opcional para verificação estatística

n = ${n}      # número de tentativas
p = ${p}    # probabilidade de sucesso em cada tentativa
k = ${k}      # número desejado de sucessos
q = 1 - p

# Cálculo puro usando biblioteca padrão math
comb = math.comb(n, k)
p_exato = comb * (p ** k) * (q ** (n - k))
p_ate_k = sum(math.comb(n, i) * (p ** i) * (q ** (n - i)) for i in range(k + 1))

media = n * p
variancia = n * p * q

print(f"P(X = {k}) = {p_exato:.6f} ({p_exato * 100:.2f}%)")
print(f"P(X <= {k}) = {p_ate_k:.6f} ({p_ate_k * 100:.2f}%)")
print(f"Média / Esperança: {media:.2f}")
print(f"Variância: {variancia:.4f}")
`;

  return {
    n,
    p,
    k,
    probExact,
    probAtMost,
    probAtLeast,
    expectedValue,
    variance,
    points,
    pythonCode,
    steps,
  };
}

export function calcBayesTheorem(probA: number, probBGivenA: number, probBGivenNotA: number) {
  if (probA < 0 || probA > 1 || probBGivenA < 0 || probBGivenA > 1 || probBGivenNotA < 0 || probBGivenNotA > 1) {
    throw new Error('Todas as probabilidades devem estar no intervalo [0, 1].');
  }

  const probNotA = 1 - probA;
  const probB = probBGivenA * probA + probBGivenNotA * probNotA;
  if (probB === 0) throw new Error('A probabilidade total P(B) é zero.');

  const probAGivenB = (probBGivenA * probA) / probB;

  const steps = [
    `Fórmula de Bayes: P(A|B) = [P(B|A) × P(A)] / P(B)`,
    `Probabilidade complementar: P(A') = 1 - P(A) = 1 - ${probA} = ${probNotA.toFixed(4)}`,
    `Probabilidade Total P(B) = P(B|A)·P(A) + P(B|A')·P(A')`,
    `P(B) = (${probBGivenA} × ${probA}) + (${probBGivenNotA} × ${probNotA.toFixed(4)}) = ${probB.toFixed(6)}`,
    `P(A|B) = (${probBGivenA * probA}) / ${probB.toFixed(6)} = ${probAGivenB.toFixed(6)} (${(probAGivenB * 100).toFixed(2)}%)`,
  ];

  const pythonCode = `# Teorema de Bayes
p_a = ${probA}               # Probabilidade a priori de A
p_b_dado_a = ${probBGivenA}       # P(B|A)
p_b_dado_nao_a = ${probBGivenNotA}   # P(B|A')

p_nao_a = 1 - p_a
# Teorema da Probabilidade Total para P(B)
p_b = (p_b_dado_a * p_a) + (p_b_dado_nao_a * p_nao_a)

p_a_dado_b = (p_b_dado_a * p_a) / p_b

print(f"P(B) Total = {p_b:.6f}")
print(f"P(A|B) Posterior = {p_a_dado_b:.6f} ({p_a_dado_b * 100:.2f}%)")
`;

  return {
    probAGivenB,
    probB,
    steps,
    pythonCode,
  };
}

/**
 * =========================================================================
 * 4. REGRA DE TRÊS (RULE OF THREE)
 * =========================================================================
 */

export function calcSimpleRuleOfThree(a1: number, b1: number, a2: number, isInverse: boolean): RuleOfThreeSimpleResult {
  if (a1 === 0 || a2 === 0) throw new Error('Os valores da primeira coluna não podem ser zero.');
  const steps: string[] = [];

  let x = 0;
  if (!isInverse) {
    // Proporção Direta: a1 / b1 = a2 / x  =>  x = (b1 * a2) / a1
    x = (b1 * a2) / a1;
    steps.push(`Tipo: Diretamente Proporcional (quando A aumenta, B aumenta na mesma proporção).`);
    steps.push(`Equação da proporção direta: ${a1} / ${b1} = ${a2} / X`);
    steps.push(`Multiplicação cruzada: ${a1} × X = ${b1} × ${a2}`);
    steps.push(`${a1} × X = ${b1 * a2}`);
    steps.push(`X = ${b1 * a2} / ${a1} = ${x}`);
  } else {
    // Proporção Inversa: a1 * b1 = a2 * x  =>  x = (a1 * b1) / a2
    x = (a1 * b1) / a2;
    steps.push(`Tipo: Inversamente Proporcional (quando A aumenta, B diminui na proporção inversa).`);
    steps.push(`Equação da proporção inversa: ${a1} × ${b1} = ${a2} × X`);
    steps.push(`${a1 * b1} = ${a2} × X`);
    steps.push(`X = ${a1 * b1} / ${a2} = ${x}`);
  }

  const pythonCode = `# Regra de Três Simples (${isInverse ? 'Inversamente' : 'Diretamente'} Proporcional)
a1 = ${a1}
b1 = ${b1}
a2 = ${a2}
is_inversa = ${isInverse ? 'True' : 'False'}

if not is_inversa:
    # Direta: a1 / b1 = a2 / x
    x = (b1 * a2) / a1
else:
    # Inversa: a1 * b1 = a2 * x
    x = (a1 * b1) / a2

print(f"O valor de X é: {x:g}")
`;

  return {
    a1,
    b1,
    a2,
    x,
    isInverse,
    steps,
    pythonCode,
  };
}

export function calcCompoundRuleOfThree(
  targetName: string,
  targetVal1: number,
  magnitudes: CompoundRuleMagnitude[]
): RuleOfThreeCompoundResult {
  if (targetVal1 === 0) throw new Error('O valor de referência da grandeza incógnita não pode ser zero.');

  const steps: string[] = [];
  steps.push(`Objetivo: Encontrar o novo valor de '${targetName}' (X), conhecendo o estado inicial = ${targetVal1}.`);

  // Formula: X = targetVal1 * (product of ratio for each magnitude)
  // If Direct: ratio = val2 / val1
  // If Inverse: ratio = val1 / val2
  let accumulatedMultiplier = 1;
  const ratioExplanations: string[] = [];

  for (const mag of magnitudes) {
    if (mag.val1 === 0 || mag.val2 === 0) {
      throw new Error(`A grandeza '${mag.name}' não pode conter valores iguais a zero.`);
    }

    if (mag.relationWithTarget === 'direct') {
      const ratio = mag.val2 / mag.val1;
      accumulatedMultiplier *= ratio;
      ratioExplanations.push(`Grandeza '${mag.name}' (Direta): razão (${mag.val2} / ${mag.val1}) = ${ratio.toFixed(4)}`);
    } else {
      const ratio = mag.val1 / mag.val2;
      accumulatedMultiplier *= ratio;
      ratioExplanations.push(`Grandeza '${mag.name}' (Inversa): razão invertida (${mag.val1} / ${mag.val2}) = ${ratio.toFixed(4)}`);
    }
  }

  const targetX = targetVal1 * accumulatedMultiplier;

  steps.push(...ratioExplanations);
  steps.push(`Equação unificada: X = ${targetVal1} × (${magnitudes.map(m => m.relationWithTarget === 'direct' ? `${m.val2}/${m.val1}` : `${m.val1}/${m.val2}`).join(' × ')})`);
  steps.push(`Multiplicador acumulado = ${accumulatedMultiplier.toFixed(6)}`);
  steps.push(`Resultado final: X = ${targetVal1} × ${accumulatedMultiplier.toFixed(6)} = ${targetX.toFixed(4)}`);

  const pythonCode = `# Regra de Três Composta
# Grandeza Incógnita: ${targetName}
target_inicial = ${targetVal1}

# Grandezas e suas relações com '${targetName}'
grandezas = [
${magnitudes.map(m => `    {"nome": "${m.name}", "v1": ${m.val1}, "v2": ${m.val2}, "tipo": "${m.relationWithTarget}"},`).join('\n')}
]

fator_acumulado = 1.0
for g in grandezas:
    if g["tipo"] == "direct":
        # Diretamente proporcional
        razao = g["v2"] / g["v1"]
    else:
        # Inversamente proporcional
        razao = g["v1"] / g["v2"]
    fator_acumulado *= razao

x_final = target_inicial * fator_acumulado
print(f"Novo valor de '${targetName}' (X) = {x_final:.4f}")
`;

  return {
    targetName,
    targetVal1,
    targetX,
    magnitudes,
    steps,
    pythonCode,
  };
}

/**
 * =========================================================================
 * 5. GEOMETRIA PLANA (PLANE GEOMETRY)
 * =========================================================================
 */

export function calcSquare(side: number): PlaneGeometryResult {
  if (side <= 0) throw new Error('O lado do quadrado deve ser positivo.');
  const area = side * side;
  const perimeter = 4 * side;
  const diagonal = side * Math.SQRT2;

  const steps = [
    `Fórmula da Área: A = L² = ${side}² = ${area}`,
    `Fórmula do Perímetro: P = 4 × L = 4 × ${side} = ${perimeter}`,
    `Diagonal: d = L√2 = ${side} × 1.4142... = ${diagonal.toFixed(4)}`,
  ];

  const pythonCode = `import math

lado = ${side}
area = lado ** 2
perimetro = 4 * lado
diagonal = lado * math.sqrt(2)

print(f"Área: {area}")
print(f"Perímetro: {perimetro}")
print(f"Diagonal: {diagonal:.4f}")
`;

  return {
    shape: 'square',
    area,
    perimeter,
    extras: { diagonal },
    steps,
    pythonCode,
  };
}

export function calcRectangle(base: number, height: number): PlaneGeometryResult {
  if (base <= 0 || height <= 0) throw new Error('A base e a altura devem ser positivas.');
  const area = base * height;
  const perimeter = 2 * (base + height);
  const diagonal = Math.hypot(base, height);

  const steps = [
    `Fórmula da Área: A = base × altura = ${base} × ${height} = ${area}`,
    `Fórmula do Perímetro: P = 2 × (base + altura) = 2 × (${base} + ${height}) = ${perimeter}`,
    `Diagonal (Pitágoras): d = √(b² + h²) = √(${base * base} + ${height * height}) = ${diagonal.toFixed(4)}`,
  ];

  const pythonCode = `import math

base = ${base}
altura = ${height}

area = base * altura
perimetro = 2 * (base + altura)
diagonal = math.hypot(base, altura)

print(f"Área: {area}")
print(f"Perímetro: {perimetro}")
print(f"Diagonal: {diagonal:.4f}")
`;

  return {
    shape: 'rectangle',
    area,
    perimeter,
    extras: { diagonal },
    steps,
    pythonCode,
  };
}

export function calcTriangle(a: number, b: number, c: number): PlaneGeometryResult {
  if (a <= 0 || b <= 0 || c <= 0) throw new Error('Todos os lados devem ser positivos.');
  if (a + b <= c || a + c <= b || b + c <= a) {
    throw new Error('Condição de existência violada: a soma de dois lados deve ser estritamente maior que o terceiro.');
  }

  const perimeter = a + b + c;
  const semi = perimeter / 2;
  // Heron formula
  const area = Math.sqrt(semi * (semi - a) * (semi - b) * (semi - c));

  const isEquilateral = Math.abs(a - b) < 1e-6 && Math.abs(b - c) < 1e-6;
  const isRight =
    Math.abs(a * a + b * b - c * c) < 1e-4 ||
    Math.abs(a * a + c * c - b * b) < 1e-4 ||
    Math.abs(b * b + c * c - a * a) < 1e-4;

  const classification = isEquilateral ? 'Equilátero' : isRight ? 'Retângulo' : (a === b || b === c || a === c) ? 'Isósceles' : 'Escaleno';

  const steps = [
    `Condição triangular válida: ${a} + ${b} > ${c}, etc. (${classification})`,
    `Perímetro: P = a + b + c = ${a} + ${b} + ${c} = ${perimeter}`,
    `Semiperímetro: s = P / 2 = ${semi}`,
    `Fórmula de Heron: A = √[s(s - a)(s - b)(s - c)]`,
    `A = √[${semi} × ${semi - a} × ${semi - b} × ${semi - c}] = ${area.toFixed(4)}`,
  ];

  const pythonCode = `import math

a, b, c = ${a}, ${b}, ${c}

perimetro = a + b + c
s = perimetro / 2  # semiperímetro

# Fórmula de Heron
area = math.sqrt(s * (s - a) * (s - b) * (s - c))

print(f"Classificação: ${classification}")
print(f"Perímetro: {perimetro}")
print(f"Área: {area:.4f}")
`;

  return {
    shape: 'triangle',
    area,
    perimeter,
    extras: { semi, classification },
    steps,
    pythonCode,
  };
}

export function calcCircle(radius: number): PlaneGeometryResult {
  if (radius <= 0) throw new Error('O raio deve ser positivo.');
  const area = Math.PI * radius * radius;
  const perimeter = 2 * Math.PI * radius;
  const diameter = 2 * radius;

  const steps = [
    `Diâmetro: D = 2 × r = ${diameter}`,
    `Comprimento / Perímetro: C = 2 × π × r = 2 × π × ${radius} = ${perimeter.toFixed(4)}`,
    `Área: A = π × r² = π × ${radius}² = ${area.toFixed(4)}`,
  ];

  const pythonCode = `import math

raio = ${radius}
diametro = 2 * raio
comprimento = 2 * math.pi * raio
area = math.pi * (raio ** 2)

print(f"Diâmetro: {diametro}")
print(f"Comprimento da Circunferência: {comprimento:.4f}")
print(f"Área do Círculo: {area:.4f}")
`;

  return {
    shape: 'circle',
    area,
    perimeter,
    extras: { diameter },
    steps,
    pythonCode,
  };
}

export function calcCircularSector(radius: number, angleDeg: number): PlaneGeometryResult {
  if (radius <= 0 || angleDeg <= 0 || angleDeg > 360) {
    throw new Error('O raio deve ser positivo e o ângulo deve estar entre 0° e 360°.');
  }

  const fraction = angleDeg / 360;
  const arcLength = fraction * (2 * Math.PI * radius);
  const area = fraction * (Math.PI * radius * radius);
  const perimeter = arcLength + 2 * radius; // incluindo os dois raios

  const steps = [
    `Fração do círculo: Ângulo / 360° = ${angleDeg}° / 360° = ${fraction.toFixed(4)}`,
    `Comprimento do arco: L = (θ / 360°) × 2πr = ${arcLength.toFixed(4)}`,
    `Área do setor: A = (θ / 360°) × πr² = ${area.toFixed(4)}`,
    `Perímetro total do setor (arco + 2r): ${perimeter.toFixed(4)}`,
  ];

  const pythonCode = `import math

raio = ${radius}
angulo_graus = ${angleDeg}

fracao = angulo_graus / 360.0
arco = fracao * (2 * math.pi * raio)
area = fracao * (math.pi * (raio ** 2))
perimetro = arco + 2 * raio

print(f"Comprimento do Arco: {arco:.4f}")
print(f"Área do Setor Circular: {area:.4f}")
print(f"Perímetro Completo do Setor: {perimetro:.4f}")
`;

  return {
    shape: 'sector',
    area,
    perimeter,
    extras: { arcLength },
    steps,
    pythonCode,
  };
}

export function calcTrapezoid(bigBase: number, smallBase: number, height: number, side1: number, side2: number): PlaneGeometryResult {
  if (bigBase <= 0 || smallBase <= 0 || height <= 0) {
    throw new Error('As bases e a altura do trapézio devem ser positivas.');
  }

  const area = ((bigBase + smallBase) * height) / 2;
  const perimeter = bigBase + smallBase + side1 + side2;

  const steps = [
    `Fórmula da Área do Trapézio: A = [(B + b) × h] / 2`,
    `A = [(${bigBase} + ${smallBase}) × ${height}] / 2 = ${area}`,
    `Perímetro: P = B + b + lado1 + lado2 = ${bigBase} + ${smallBase} + ${side1} + ${side2} = ${perimeter}`,
  ];

  const pythonCode = `base_maior = ${bigBase}
base_menor = ${smallBase}
altura = ${height}
lado1 = ${side1}
lado2 = ${side2}

area = ((base_maior + base_menor) * altura) / 2
perimetro = base_maior + base_menor + lado1 + lado2

print(f"Área do Trapézio: {area}")
print(f"Perímetro: {perimetro}")
`;

  return {
    shape: 'trapezoid',
    area,
    perimeter,
    steps,
    pythonCode,
  };
}

export function calcRhombus(bigDiag: number, smallDiag: number): PlaneGeometryResult {
  if (bigDiag <= 0 || smallDiag <= 0) throw new Error('As diagonais do losango devem ser positivas.');
  const area = (bigDiag * smallDiag) / 2;
  // Side using right triangle formed by half diagonals
  const side = Math.hypot(bigDiag / 2, smallDiag / 2);
  const perimeter = 4 * side;

  const steps = [
    `Fórmula da Área: A = (D × d) / 2 = (${bigDiag} × ${smallDiag}) / 2 = ${area}`,
    `Lado do Losango (Pitágoras com meias diagonais): L = √[(D/2)² + (d/2)²] = ${side.toFixed(4)}`,
    `Perímetro: P = 4 × L = 4 × ${side.toFixed(4)} = ${perimeter.toFixed(4)}`,
  ];

  const pythonCode = `import math

diag_maior = ${bigDiag}
diag_menor = ${smallDiag}

area = (diag_maior * diag_menor) / 2
lado = math.hypot(diag_maior / 2, diag_menor / 2)
perimetro = 4 * lado

print(f"Área do Losango: {area}")
print(f"Comprimento do Lado: {lado:.4f}")
print(f"Perímetro: {perimetro:.4f}")
`;

  return {
    shape: 'rhombus',
    area,
    perimeter,
    extras: { side },
    steps,
    pythonCode,
  };
}

export function calcRegularPolygon(sidesCount: number, sideLength: number): PlaneGeometryResult {
  if (sidesCount < 3) throw new Error('Um polígono deve ter no mínimo 3 lados.');
  if (sideLength <= 0) throw new Error('O comprimento do lado deve ser positivo.');

  const perimeter = sidesCount * sideLength;
  // Apothem: a = s / (2 * tan(pi / n))
  const apothem = sideLength / (2 * Math.tan(Math.PI / sidesCount));
  const area = (perimeter * apothem) / 2;

  const steps = [
    `Perímetro: P = n × L = ${sidesCount} × ${sideLength} = ${perimeter}`,
    `Apótema: a = L / [2 × tan(180° / n)] = ${apothem.toFixed(4)}`,
    `Área: A = (Perímetro × Apótema) / 2 = (${perimeter} × ${apothem.toFixed(4)}) / 2 = ${area.toFixed(4)}`,
  ];

  const pythonCode = `import math

n = ${sidesCount}      # número de lados
lado = ${sideLength} # comprimento de cada lado

perimetro = n * lado
apotema = lado / (2 * math.tan(math.pi / n))
area = (perimetro * apotema) / 2

print(f"Perímetro: {perimetro}")
print(f"Apótema: {apotema:.4f}")
print(f"Área do Polígono Regular: {area:.4f}")
`;

  return {
    shape: 'regular_polygon',
    area,
    perimeter,
    extras: { apothem },
    steps,
    pythonCode,
  };
}

/**
 * =========================================================================
 * 6. GEOMETRIA ESPACIAL (SPATIAL / SOLID GEOMETRY)
 * =========================================================================
 */

export function calcCube(edge: number): SpatialGeometryResult {
  if (edge <= 0) throw new Error('A aresta do cubo deve ser positiva.');
  const baseArea = edge * edge;
  const lateralArea = 4 * baseArea;
  const totalArea = 6 * baseArea;
  const volume = Math.pow(edge, 3);
  const spaceDiagonal = edge * Math.sqrt(3);

  const steps = [
    `Área da Base: A_b = a² = ${edge}² = ${baseArea}`,
    `Área Lateral: A_l = 4 × a² = 4 × ${baseArea} = ${lateralArea}`,
    `Área Total da Superfície: A_t = 6 × a² = 6 × ${baseArea} = ${totalArea}`,
    `Volume: V = a³ = ${edge}³ = ${volume}`,
    `Diagonal do Cubo: D = a√3 = ${edge} × 1.73205... = ${spaceDiagonal.toFixed(4)}`,
  ];

  const pythonCode = `import math

aresta = ${edge}

area_base = aresta ** 2
area_lateral = 4 * (aresta ** 2)
area_total = 6 * (aresta ** 2)
volume = aresta ** 3
diagonal = aresta * math.sqrt(3)

print(f"Volume do Cubo: {volume}")
print(f"Área Total da Superfície: {area_total}")
print(f"Diagonal Espacial: {diagonal:.4f}")
`;

  return {
    shape: 'cube',
    baseArea,
    lateralArea,
    totalArea,
    volume,
    extras: { spaceDiagonal },
    steps,
    pythonCode,
  };
}

export function calcCuboid(length: number, width: number, height: number): SpatialGeometryResult {
  if (length <= 0 || width <= 0 || height <= 0) {
    throw new Error('Todas as dimensões do paralelepípedo devem ser positivas.');
  }

  const baseArea = length * width;
  const lateralArea = 2 * (length * height + width * height);
  const totalArea = 2 * (length * width + length * height + width * height);
  const volume = length * width * height;
  const diagonal = Math.hypot(length, width, height);

  const steps = [
    `Área da Base: A_b = a × b = ${length} × ${width} = ${baseArea}`,
    `Área Lateral: A_l = 2 × (a×c + b×c) = ${lateralArea}`,
    `Área Total: A_t = 2 × (ab + ac + bc) = ${totalArea}`,
    `Volume: V = a × b × c = ${length} × ${width} × ${height} = ${volume}`,
    `Diagonal Espacial: D = √(a² + b² + c²) = ${diagonal.toFixed(4)}`,
  ];

  const pythonCode = `import math

a = ${length}  # comprimento
b = ${width}   # largura
c = ${height}  # altura

volume = a * b * c
area_total = 2 * (a * b + a * c + b * c)
diagonal = math.sqrt(a**2 + b**2 + c**2)

print(f"Volume: {volume}")
print(f"Área Total: {area_total}")
print(f"Diagonal: {diagonal:.4f}")
`;

  return {
    shape: 'cuboid',
    baseArea,
    lateralArea,
    totalArea,
    volume,
    extras: { diagonal },
    steps,
    pythonCode,
  };
}

export function calcCylinder(radius: number, height: number): SpatialGeometryResult {
  if (radius <= 0 || height <= 0) throw new Error('O raio e a altura do cilindro devem ser positivos.');

  const baseArea = Math.PI * radius * radius;
  const lateralArea = 2 * Math.PI * radius * height;
  const totalArea = 2 * baseArea + lateralArea;
  const volume = baseArea * height;

  const steps = [
    `Área de uma Base: A_b = π × r² = π × ${radius}² = ${baseArea.toFixed(4)}`,
    `Área Lateral: A_l = 2 × π × r × h = 2 × π × ${radius} × ${height} = ${lateralArea.toFixed(4)}`,
    `Área Total: A_t = 2×A_b + A_l = ${totalArea.toFixed(4)}`,
    `Volume: V = π × r² × h = ${volume.toFixed(4)}`,
  ];

  const pythonCode = `import math

raio = ${radius}
altura = ${height}

area_base = math.pi * (raio ** 2)
area_lateral = 2 * math.pi * raio * altura
area_total = 2 * area_base + area_lateral
volume = area_base * altura

print(f"Volume do Cilindro: {volume:.4f}")
print(f"Área Lateral: {area_lateral:.4f}")
print(f"Área Total: {area_total:.4f}")
`;

  return {
    shape: 'cylinder',
    baseArea,
    lateralArea,
    totalArea,
    volume,
    steps,
    pythonCode,
  };
}

export function calcSphere(radius: number): SpatialGeometryResult {
  if (radius <= 0) throw new Error('O raio da esfera deve ser positivo.');

  const totalArea = 4 * Math.PI * radius * radius;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const greatCircleArea = Math.PI * radius * radius;

  const steps = [
    `Área da Seção Equatorial (Círculo Máximo): A_cm = π × r² = ${greatCircleArea.toFixed(4)}`,
    `Área da Superfície Esférica: A = 4 × π × r² = 4 × π × ${radius}² = ${totalArea.toFixed(4)}`,
    `Volume da Esfera: V = (4/3) × π × r³ = (4/3) × π × ${radius}³ = ${volume.toFixed(4)}`,
  ];

  const pythonCode = `import math

raio = ${radius}

area_superficie = 4 * math.pi * (raio ** 2)
volume = (4.0 / 3.0) * math.pi * (raio ** 3)

print(f"Volume da Esfera: {volume:.4f}")
print(f"Área Superficial: {area_superficie:.4f}")
`;

  return {
    shape: 'sphere',
    baseArea: greatCircleArea,
    lateralArea: totalArea,
    totalArea,
    volume,
    steps,
    pythonCode,
  };
}

export function calcCone(radius: number, height: number): SpatialGeometryResult {
  if (radius <= 0 || height <= 0) throw new Error('O raio e a altura do cone devem ser positivos.');

  const generatrix = Math.hypot(radius, height);
  const baseArea = Math.PI * radius * radius;
  const lateralArea = Math.PI * radius * generatrix;
  const totalArea = baseArea + lateralArea;
  const volume = (1 / 3) * baseArea * height;

  const steps = [
    `Geratriz do Cone (Pitágoras): g = √(r² + h²) = √(${radius * radius} + ${height * height}) = ${generatrix.toFixed(4)}`,
    `Área da Base: A_b = π × r² = ${baseArea.toFixed(4)}`,
    `Área Lateral: A_l = π × r × g = π × ${radius} × ${generatrix.toFixed(4)} = ${lateralArea.toFixed(4)}`,
    `Área Total: A_t = A_b + A_l = ${totalArea.toFixed(4)}`,
    `Volume: V = (1/3) × π × r² × h = ${volume.toFixed(4)}`,
  ];

  const pythonCode = `import math

raio = ${radius}
altura = ${height}

geratriz = math.hypot(raio, altura)
area_base = math.pi * (raio ** 2)
area_lateral = math.pi * raio * geratriz
area_total = area_base + area_lateral
volume = (1.0 / 3.0) * area_base * altura

print(f"Geratriz (g): {geratriz:.4f}")
print(f"Volume do Cone: {volume:.4f}")
print(f"Área Total: {area_total:.4f}")
`;

  return {
    shape: 'cone',
    baseArea,
    lateralArea,
    totalArea,
    volume,
    extras: { generatrix },
    steps,
    pythonCode,
  };
}

export function calcPyramid(baseSide: number, height: number): SpatialGeometryResult {
  if (baseSide <= 0 || height <= 0) throw new Error('O lado da base e a altura da pirâmide devem ser positivos.');

  const baseArea = baseSide * baseSide;
  // Apothem of pyramid face: g = sqrt(h^2 + (s/2)^2)
  const apothem = Math.hypot(height, baseSide / 2);
  const lateralArea = 4 * ((baseSide * apothem) / 2);
  const totalArea = baseArea + lateralArea;
  const volume = (1 / 3) * baseArea * height;

  const steps = [
    `Base Quadrada: Lado = ${baseSide}, A_b = ${baseArea}`,
    `Apótema da Pirâmide (face): g = √[h² + (L/2)²] = √[${height * height} + ${(baseSide / 2) * (baseSide / 2)}] = ${apothem.toFixed(4)}`,
    `Área Lateral (4 triângulos): A_l = 4 × [(L × g)/2] = ${lateralArea.toFixed(4)}`,
    `Área Total: A_t = A_b + A_l = ${totalArea.toFixed(4)}`,
    `Volume: V = (1/3) × A_b × h = (1/3) × ${baseArea} × ${height} = ${volume.toFixed(4)}`,
  ];

  const pythonCode = `import math

lado_base = ${baseSide}
altura = ${height}

area_base = lado_base ** 2
apotema_face = math.hypot(altura, lado_base / 2)
area_lateral = 4 * ((lado_base * apotema_face) / 2)
area_total = area_base + area_lateral
volume = (1.0 / 3.0) * area_base * altura

print(f"Apótema da Face: {apotema_face:.4f}")
print(f"Volume da Pirâmide: {volume:.4f}")
print(f"Área Total: {area_total:.4f}")
`;

  return {
    shape: 'pyramid',
    baseArea,
    lateralArea,
    totalArea,
    volume,
    extras: { apothem },
    steps,
    pythonCode,
  };
}

export function calcFrustumCone(bigR: number, smallR: number, height: number): SpatialGeometryResult {
  if (bigR <= 0 || smallR <= 0 || height <= 0 || bigR <= smallR) {
    throw new Error('O raio maior deve ser estritamente maior que o raio menor, e a altura deve ser positiva.');
  }

  const generatrix = Math.hypot(height, bigR - smallR);
  const baseArea1 = Math.PI * bigR * bigR;
  const baseArea2 = Math.PI * smallR * smallR;
  const lateralArea = Math.PI * (bigR + smallR) * generatrix;
  const totalArea = baseArea1 + baseArea2 + lateralArea;
  const volume = (Math.PI * height * (bigR * bigR + bigR * smallR + smallR * smallR)) / 3;

  const steps = [
    `Geratriz do Tronco: g = √[h² + (R - r)²] = ${generatrix.toFixed(4)}`,
    `Área da Base Maior: π × R² = ${baseArea1.toFixed(4)}`,
    `Área da Base Menor: π × r² = ${baseArea2.toFixed(4)}`,
    `Área Lateral: A_l = π × (R + r) × g = ${lateralArea.toFixed(4)}`,
    `Área Total: A_t = A_b1 + A_b2 + A_l = ${totalArea.toFixed(4)}`,
    `Fórmula do Volume: V = (π × h / 3) × (R² + Rr + r²) = ${volume.toFixed(4)}`,
  ];

  const pythonCode = `import math

R = ${bigR}      # raio maior
r = ${smallR}    # raio menor
h = ${height}    # altura

geratriz = math.hypot(h, R - r)
area_base_maior = math.pi * (R ** 2)
area_base_menor = math.pi * (r ** 2)
area_lateral = math.pi * (R + r) * geratriz
area_total = area_base_maior + area_base_menor + area_lateral

volume = (math.pi * h / 3.0) * (R**2 + R*r + r**2)

print(f"Geratriz: {geratriz:.4f}")
print(f"Volume do Tronco de Cone: {volume:.4f}")
print(f"Área Total: {area_total:.4f}")
`;

  return {
    shape: 'frustum_cone',
    baseArea: baseArea1,
    lateralArea,
    totalArea,
    volume,
    extras: { generatrix, smallBaseArea: baseArea2 },
    steps,
    pythonCode,
  };
}
