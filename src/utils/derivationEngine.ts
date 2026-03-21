import type { Formula } from '../data/physicsData';
import { physicsQuantities, formulas } from '../data/physicsData';

export interface DerivationStep {
  formula: Formula;
  newlyDerived: string[];
}

export interface DerivationResult {
  path: DerivationStep[];
  derivedQuantities: Set<string>;
  success: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  type: 'known' | 'formula' | 'target';
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'input' | 'output';
}

export function findDerivationPath(
  knownQuantities: string[],
  targetQuantities: string[]
): DerivationResult {
  const derived = new Set<string>(knownQuantities);
  const path: DerivationStep[] = [];
  const usedFormulas = new Set<string>();

  const targets = new Set(targetQuantities);
  let foundNew = true;

  while (foundNew && !isSubset(targets, derived)) {
    foundNew = false;

    for (const formula of formulas) {
      if (usedFormulas.has(formula.id)) continue;

      const allInputsAvailable = formula.inputs.every(input => derived.has(input));
      const hasNewOutput = formula.outputs.some(output => !derived.has(output));

      if (allInputsAvailable && hasNewOutput) {
        const newlyDerived = formula.outputs.filter(output => !derived.has(output));
        newlyDerived.forEach(q => derived.add(q));

        path.push({
          formula,
          newlyDerived
        });

        usedFormulas.add(formula.id);
        foundNew = true;
      }
    }
  }

  return {
    path,
    derivedQuantities: derived,
    success: isSubset(targets, derived)
  };
}

function isSubset(subset: Set<string>, superset: Set<string>): boolean {
  for (const item of subset) {
    if (!superset.has(item)) return false;
  }
  return true;
}

export function buildVisualizationGraph(
  knownQuantities: string[],
  targetQuantities: string[],
  derivationPath: DerivationStep[]
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeIds = new Set<string>();

  const getQuantity = (id: string) => physicsQuantities.find(q => q.id === id);

  knownQuantities.forEach(id => {
    const q = getQuantity(id);
    if (q && !nodeIds.has(id)) {
      nodes.push({
        id,
        label: q.name,
        symbol: q.symbol,
        unit: q.unit,
        type: 'known'
      });
      nodeIds.add(id);
    }
  });

  targetQuantities.forEach(id => {
    const q = getQuantity(id);
    if (q && !nodeIds.has(id)) {
      nodes.push({
        id,
        label: q.name,
        symbol: q.symbol,
        unit: q.unit,
        type: 'target'
      });
      nodeIds.add(id);
    } else if (q && nodeIds.has(id)) {
      const node = nodes.find(n => n.id === id);
      if (node && node.type === 'known') {
        node.type = 'target';
      }
    }
  });

  derivationPath.forEach((step) => {
    const formulaNodeId = `formula_${step.formula.id}`;

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

    step.formula.inputs.forEach(inputId => {
      if (!nodeIds.has(inputId)) {
        const q = getQuantity(inputId);
        if (q) {
          nodes.push({
            id: inputId,
            label: q.name,
            symbol: q.symbol,
            unit: q.unit,
            type: 'known'
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

    step.formula.outputs.forEach(outputId => {
      if (!nodeIds.has(outputId)) {
        const q = getQuantity(outputId);
        if (q) {
          nodes.push({
            id: outputId,
            label: q.name,
            symbol: q.symbol,
            unit: q.unit,
            type: targetQuantities.includes(outputId) ? 'target' : 'known'
          });
          nodeIds.add(outputId);
        }
      }
      links.push({
        source: formulaNodeId,
        target: outputId,
        type: 'output'
      });
    });
  });

  return { nodes, links };
}
