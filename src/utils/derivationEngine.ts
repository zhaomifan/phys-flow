import type { Formula } from '../data/physicsData';
import { physicsQuantities, formulas } from '../data/physicsData';

export interface DerivationStep {
  formula: Formula;
  knownInputs: string[];   // 已知的输入量
  derived: string;         // 推导出的物理量
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
 * 核心推导算法：
 * 对于每个公式(涉及n个物理量)，如果已知n-1个，就能推导出剩下的1个
 * 支持链式推导：公式1推出的新量可以作为公式2的输入
 * 避免循环：用 visited 集合记录已尝试的 (公式, 目标量) 组合
 */
export function findDerivationPath(
  knownQuantities: string[],
  targetQuantities: string[]
): DerivationResult {
  if (knownQuantities.length === 0) {
    return { path: [], derivedQuantities: new Set(), success: false, reason: '未选择已知量' };
  }
  if (targetQuantities.length === 0) {
    return { path: [], derivedQuantities: new Set(knownQuantities), success: false, reason: '未选择目标量' };
  }

  // 当前已知的物理量集合
  const known = new Set<string>(knownQuantities);
  const targets = new Set(targetQuantities);
  const path: DerivationStep[] = [];

  // 记录已使用的推导组合，避免循环: "formulaId:unknownId"
  const usedDerivations = new Set<string>();

  // 检查目标是否已全部达成
  const allTargetsReached = () => {
    for (const t of targets) {
      if (!known.has(t)) return false;
    }
    return true;
  };

  let iteration = 0;
  const maxIterations = 50; // 防止无限循环

  while (!allTargetsReached() && iteration < maxIterations) {
    iteration++;
    let foundNewInThisRound = false;

    for (const formula of formulas) {
      if (allTargetsReached()) break;

      // 统计公式中已知和未知的物理量
      const knownInFormula: string[] = [];
      const unknownInFormula: string[] = [];

      for (const q of formula.quantities) {
        if (known.has(q)) {
          knownInFormula.push(q);
        } else {
          unknownInFormula.push(q);
        }
      }

      // 关键条件：已知 n-1 个，未知 1 个，就可以推导
      if (unknownInFormula.length === 1 && knownInFormula.length === formula.quantities.length - 1) {
        const unknownId = unknownInFormula[0];
        const derivationKey = `${formula.id}:${unknownId}`;

        // 避免重复推导
        if (usedDerivations.has(derivationKey)) continue;

        // 推导出新的物理量
        known.add(unknownId);
        usedDerivations.add(derivationKey);

        path.push({
          formula,
          knownInputs: [...knownInFormula],
          derived: unknownId
        });

        foundNewInThisRound = true;
      }
    }

    // 如果这一轮没有找到任何新推导，说明无法继续
    if (!foundNewInThisRound) break;
  }

  // 判断是否成功
  const success = allTargetsReached();
  let reason: string | undefined;
  if (!success) {
    const missingTargets = [...targets].filter(t => !known.has(t));
    const missingNames = missingTargets.map(id => {
      const q = physicsQuantities.find(q => q.id === id);
      return q ? `${q.name}(${q.symbol})` : id;
    });
    reason = `无法推导: ${missingNames.join('、')}`;
  }

  return {
    path,
    derivedQuantities: known,
    success,
    reason
  };
}

/**
 * 构建可视化图谱数据
 */
export function buildVisualizationGraph(
  knownQuantities: string[],
  targetQuantities: string[],
  derivationPath: DerivationStep[]
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeIds = new Set<string>();

  const getQuantity = (id: string) => physicsQuantities.find(q => q.id === id);
  const addTarget = new Set(targetQuantities);

  // 添加已知量节点
  knownQuantities.forEach(id => {
    const q = getQuantity(id);
    if (q && !nodeIds.has(id)) {
      // 如果同时也是目标量，标记为 target
      const isTarget = addTarget.has(id);
      nodes.push({
        id,
        label: q.name,
        symbol: q.symbol,
        unit: q.unit,
        type: isTarget ? 'target' : 'known'
      });
      nodeIds.add(id);
    }
  });

  // 添加目标量节点（如果是纯目标，不在已知中）
  targetQuantities.forEach(id => {
    if (!nodeIds.has(id)) {
      const q = getQuantity(id);
      if (q) {
        nodes.push({
          id,
          label: q.name,
          symbol: q.symbol,
          unit: q.unit,
          type: 'target'
        });
        nodeIds.add(id);
      }
    }
  });

  // 添加推导路径中的公式节点和链接
  derivationPath.forEach((step) => {
    const formulaNodeId = `formula_${step.formula.id}_${step.derived}`;

    // 添加公式节点
    if (!nodeIds.has(formulaNodeId)) {
      nodes.push({
        id: formulaNodeId,
        label: step.formula.name,
        symbol: step.formula.latex,
        unit: '',
        type: 'formula'
      });
      nodeIds.add(formulaNodeId);
    }

    // 添加从已知量到公式的链接（输入）
    step.knownInputs.forEach(inputId => {
      // 如果中间推导出的量还没有节点，添加为 derived
      if (!nodeIds.has(inputId)) {
        const q = getQuantity(inputId);
        if (q) {
          nodes.push({
            id: inputId,
            label: q.name,
            symbol: q.symbol,
            unit: q.unit,
            type: 'derived'
          });
          nodeIds.add(inputId);
        }
      }
      links.push({
        source: inputId,
        target: formulaNodeId,
        type: 'input'
      });
    });

    // 添加从公式到推导量的链接（输出）
    if (!nodeIds.has(step.derived)) {
      const q = getQuantity(step.derived);
      if (q) {
        const isTarget = addTarget.has(step.derived);
        nodes.push({
          id: step.derived,
          label: q.name,
          symbol: q.symbol,
          unit: q.unit,
          type: isTarget ? 'target' : 'derived'
        });
        nodeIds.add(step.derived);
      }
    }
    links.push({
      source: formulaNodeId,
      target: step.derived,
      type: 'output'
    });
  });

  return { nodes, links };
}
