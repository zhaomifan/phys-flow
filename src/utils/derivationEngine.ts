import type { Formula } from '../data/physicsData';
import { physicsQuantities, formulas } from '../data/physicsData';

export interface DerivationStep {
  formula: Formula;
  knownInputs: string[];   // 使用的已知量
  derived: string;         // 推导出的物理量
  depth: number;           // 推导深度
}

export interface DerivationResult {
  path: DerivationStep[];
  derivedQuantities: Set<string>;
  success: boolean;
  reason?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  type: 'known' | 'formula' | 'target' | 'derived';
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'input' | 'output';
}

/**
 * 核心推导算法
 * 
 * 规则：
 * 1. 一个公式包含 n 个物理量，已知 n-1 个即可推导出剩余 1 个
 * 2. 推导出的新量可以作为其他公式的已知量继续推导（链式）
 * 3. 防循环：同一公式对同一未知量只能推导一次
 * 4. 终止条件：目标量全部推导出，或无法继续推导
 */
export function findDerivationPath(
  knownQuantities: string[],
  targetQuantities: string[]
): DerivationResult {
  // 边界检查
  if (knownQuantities.length === 0) {
    return { path: [], derivedQuantities: new Set(), success: false, reason: '请先选择已知物理量' };
  }
  if (targetQuantities.length === 0) {
    return { path: [], derivedQuantities: new Set(knownQuantities), success: false, reason: '请选择要推导的目标量' };
  }

  const known = new Set<string>(knownQuantities);
  const targets = new Set(targetQuantities);
  const path: DerivationStep[] = [];

  // 检查已知量是否已包含目标量
  const alreadyKnown = targetQuantities.filter(t => known.has(t));
  if (alreadyKnown.length === targetQuantities.length) {
    return { path: [], derivedQuantities: known, success: true, reason: '目标量已是已知量' };
  }

  // 记录已使用的推导，避免循环: "formulaId→unknownId"
  const usedDerivations = new Set<string>();

  // 判断目标是否全部达成
  const allTargetsReached = (): boolean => {
    for (const t of targets) {
      if (!known.has(t)) return false;
    }
    return true;
  };

  /**
   * 尝试使用某个公式推导一个未知量
   * 返回：可推导的未知量，或 null
   */
  const tryDerive = (formula: Formula): { unknown: string; knownInputs: string[] } | null => {
    const knownInFormula: string[] = [];
    const unknownInFormula: string[] = [];

    for (const q of formula.quantities) {
      if (known.has(q)) {
        knownInFormula.push(q);
      } else {
        unknownInFormula.push(q);
      }
    }

    // 核心条件：已知 n-1 个，未知恰好 1 个
    if (unknownInFormula.length === 1 && knownInFormula.length === formula.quantities.length - 1) {
      const unknownId = unknownInFormula[0];
      const key = `${formula.id}→${unknownId}`;

      // 检查是否已用过此推导
      if (!usedDerivations.has(key)) {
        return { unknown: unknownId, knownInputs: knownInFormula };
      }
    }
    return null;
  };

  let depth = 0;
  const maxIterations = 100;

  // 主推导循环
  while (!allTargetsReached() && depth < maxIterations) {
    let foundThisRound = false;
    depth++;

    // 优先级1：直接推导目标量的公式
    for (const formula of formulas) {
      if (allTargetsReached()) break;

      const result = tryDerive(formula);
      if (result && targets.has(result.unknown)) {
        known.add(result.unknown);
        usedDerivations.add(`${formula.id}→${result.unknown}`);
        path.push({
          formula,
          knownInputs: result.knownInputs,
          derived: result.unknown,
          depth
        });
        foundThisRound = true;
      }
    }

    // 优先级2：推导中间量（可能被后续公式使用）
    for (const formula of formulas) {
      if (allTargetsReached()) break;

      const result = tryDerive(formula);
      if (result && !targets.has(result.unknown)) {
        known.add(result.unknown);
        usedDerivations.add(`${formula.id}→${result.unknown}`);
        path.push({
          formula,
          knownInputs: result.knownInputs,
          derived: result.unknown,
          depth
        });
        foundThisRound = true;
      }
    }

    // 这一轮没有任何新推导，终止
    if (!foundThisRound) break;
  }

  // 判断结果
  const success = allTargetsReached();
  let reason: string | undefined;

  if (!success) {
    const missing = [...targets].filter(t => !known.has(t));
    const names = missing.map(id => {
      const q = physicsQuantities.find(q => q.id === id);
      return q ? `${q.name}(${q.symbol})` : id;
    });
    reason = `缺少条件，无法推导：${names.join('、')}`;
  }

  return {
    path,
    derivedQuantities: known,
    success,
    reason
  };
}

/**
 * 构建可视化图谱
 */
export function buildVisualizationGraph(
  knownQuantities: string[],
  targetQuantities: string[],
  derivationPath: DerivationStep[]
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeIds = new Set<string>();
  const targetSet = new Set(targetQuantities);

  const getQuantity = (id: string) => physicsQuantities.find(q => q.id === id);

  const addQuantityNode = (id: string, forceType?: GraphNode['type']) => {
    if (nodeIds.has(id)) return;
    const q = getQuantity(id);
    if (!q) return;

    let type: GraphNode['type'];
    if (forceType) {
      type = forceType;
    } else if (knownQuantities.includes(id)) {
      type = targetSet.has(id) ? 'target' : 'known';
    } else if (targetSet.has(id)) {
      type = 'target';
    } else {
      type = 'derived';
    }

    nodes.push({
      id,
      label: q.name,
      symbol: q.symbol,
      unit: q.unit,
      type
    });
    nodeIds.add(id);
  };

  // 添加初始已知量
  knownQuantities.forEach(id => addQuantityNode(id));

  // 添加目标量（如果不在已知中）
  targetQuantities.forEach(id => addQuantityNode(id));

  // 处理每个推导步骤
  derivationPath.forEach((step) => {
    const formulaId = `formula_${step.formula.id}_${step.derived}`;

    // 添加公式节点
    if (!nodeIds.has(formulaId)) {
      nodes.push({
        id: formulaId,
        label: step.formula.name,
        symbol: step.formula.latex,
        unit: '',
        type: 'formula'
      });
      nodeIds.add(formulaId);
    }

    // 输入链接：已知量 → 公式
    step.knownInputs.forEach(inputId => {
      addQuantityNode(inputId);
      links.push({
        source: inputId,
        target: formulaId,
        type: 'input'
      });
    });

    // 输出链接：公式 → 推导量
    addQuantityNode(step.derived);
    links.push({
      source: formulaId,
      target: step.derived,
      type: 'output'
    });
  });

  return { nodes, links };
}
