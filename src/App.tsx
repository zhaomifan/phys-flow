import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import QuantitySelector from './components/QuantitySelector';
import DerivationSteps from './components/DerivationSteps';
import DerivationGraph from './components/DerivationGraph';
import { findDerivationPath, buildVisualizationGraph } from './utils/derivationEngine';
import './App.css';

const App: React.FC = () => {
  const [knownQuantities, setKnownQuantities] = useState<string[]>([]);
  const [targetQuantities, setTargetQuantities] = useState<string[]>([]);
  const [graphDimensions, setGraphDimensions] = useState({ width: 600, height: 400 });
  const graphContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (graphContainerRef.current) {
        const { clientWidth, clientHeight } = graphContainerRef.current;
        setGraphDimensions({
          width: clientWidth || 600,
          height: clientHeight || 400
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const derivationResult = useMemo(() => {
    if (knownQuantities.length === 0 || targetQuantities.length === 0) {
      return { path: [], derivedQuantities: new Set<string>(), success: false };
    }
    return findDerivationPath(knownQuantities, targetQuantities);
  }, [knownQuantities, targetQuantities]);

  const graphData = useMemo(() => {
    if (derivationResult.path.length === 0) {
      return { nodes: [], links: [] };
    }
    return buildVisualizationGraph(knownQuantities, targetQuantities, derivationResult.path);
  }, [knownQuantities, targetQuantities, derivationResult.path]);

  const handleKnownChange = useCallback((selected: string[]) => {
    setKnownQuantities(selected);
    setTargetQuantities(prev => prev.filter(id => !selected.includes(id)));
  }, []);

  const handleTargetChange = useCallback((selected: string[]) => {
    setTargetQuantities(selected);
    setKnownQuantities(prev => prev.filter(id => !selected.includes(id)));
  }, []);

  const swapSelections = useCallback(() => {
    const tempKnown = knownQuantities;
    const tempTarget = targetQuantities;
    setKnownQuantities(tempTarget);
    setTargetQuantities(tempKnown);
  }, [knownQuantities, targetQuantities]);

  const clearAll = useCallback(() => {
    setKnownQuantities([]);
    setTargetQuantities([]);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>⚛️ PhysFlow</h1>
          <p className="subtitle">物理公式推导可视化工具</p>
        </div>
        <div className="header-actions">
          <button className="swap-btn" onClick={swapSelections} disabled={knownQuantities.length === 0 && targetQuantities.length === 0}>
            ⇄ 交换
          </button>
          <button className="clear-all-btn" onClick={clearAll} disabled={knownQuantities.length === 0 && targetQuantities.length === 0}>
            ✕ 清空全部
          </button>
        </div>
      </header>

      <main className="main-content">
        <aside className="panel left-panel">
          <QuantitySelector
            title="已知量"
            selected={knownQuantities}
            onChange={handleKnownChange}
            excludeIds={targetQuantities}
            color="#4CAF50"
          />
        </aside>

        <section className="panel center-panel">
          <div className="graph-section" ref={graphContainerRef}>
            <h3>推导图谱</h3>
            <DerivationGraph
              nodes={graphData.nodes}
              links={graphData.links}
              width={graphDimensions.width}
              height={graphDimensions.height - 40}
            />
          </div>
          <div className="steps-section">
            <DerivationSteps
              steps={derivationResult.path}
              success={derivationResult.success}
              knownQuantities={knownQuantities}
              targetQuantities={targetQuantities}
            />
          </div>
        </section>

        <aside className="panel right-panel">
          <QuantitySelector
            title="目标量"
            selected={targetQuantities}
            onChange={handleTargetChange}
            excludeIds={knownQuantities}
            color="#F44336"
          />
        </aside>
      </main>

      <footer className="app-footer">
        <p>选择已知物理量和目标物理量，系统将自动推导公式关系</p>
        <p className="tips">
          💡 提示：拖拽节点可调整位置，滚轮可缩放图谱
        </p>
      </footer>
    </div>
  );
};

export default App;
