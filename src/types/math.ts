export type CalculatorTab =
  | 'scientific'
  | 'percentage'
  | 'scale'
  | 'probability'
  | 'rule_of_three'
  | 'plane_geometry'
  | 'spatial_geometry'
  | 'python_studio';

export interface CalculationHistoryItem {
  id: string;
  category: string;
  title: string;
  expression: string;
  result: string | number;
  steps: string[];
  pythonCode: string;
  timestamp: number;
}

export interface StepExplanation {
  title: string;
  formula: string;
  calculation: string;
  result: string;
}

export type UnitLength = 'mm' | 'cm' | 'm' | 'km';

export interface ScaleCalculationResult {
  scaleRatio: number;
  paperDistance: number;
  paperUnit: UnitLength;
  realDistance: number;
  realUnit: UnitLength;
  scaleString: string;
  areaScaleString: string;
  volumeScaleString: string;
  steps: string[];
  pythonCode: string;
}

export interface PercentageResult {
  type: 'percent_of' | 'is_what_percent' | 'variation' | 'increase_decrease' | 'simple_interest' | 'compound_interest';
  value: number;
  steps: string[];
  pythonCode: string;
}

export interface CombinatoricsResult {
  n: number;
  p?: number;
  result: number;
  formula: string;
  steps: string[];
  pythonCode: string;
}

export interface BinomialPoint {
  k: number;
  prob: number;
  cumulative: number;
}

export interface BinomialResult {
  n: number;
  p: number;
  k: number;
  probExact: number;
  probAtMost: number;
  probAtLeast: number;
  expectedValue: number;
  variance: number;
  points: BinomialPoint[];
  pythonCode: string;
  steps: string[];
}

export interface RuleOfThreeSimpleResult {
  a1: number;
  b1: number;
  a2: number;
  x: number;
  isInverse: boolean;
  steps: string[];
  pythonCode: string;
}

export interface CompoundRuleMagnitude {
  id: string;
  name: string;
  val1: number;
  val2: number;
  relationWithTarget: 'direct' | 'inverse'; // em relação à grandeza incógnita
}

export interface RuleOfThreeCompoundResult {
  targetName: string;
  targetVal1: number;
  targetX: number;
  magnitudes: CompoundRuleMagnitude[];
  steps: string[];
  pythonCode: string;
}

export interface PlaneGeometryResult {
  shape: 'square' | 'rectangle' | 'triangle' | 'circle' | 'sector' | 'trapezoid' | 'rhombus' | 'regular_polygon';
  area: number;
  perimeter: number;
  extras?: Record<string, number | string>;
  steps: string[];
  pythonCode: string;
}

export interface SpatialGeometryResult {
  shape: 'cube' | 'cuboid' | 'cylinder' | 'sphere' | 'cone' | 'pyramid' | 'frustum_cone';
  baseArea: number;
  lateralArea: number;
  totalArea: number;
  volume: number;
  extras?: Record<string, number | string>;
  steps: string[];
  pythonCode: string;
}
