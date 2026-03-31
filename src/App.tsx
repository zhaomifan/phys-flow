import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import QuantitySelector from './components/QuantitySelector';
import DerivationSteps from './components/DerivationSteps';
import DerivationGraph from './components/DerivationGraph';
import { findDerivationPath, buildVisualizationGraph } from './utils/derivationEngine';
import logoSvg from './assets/PhysFlow.svg';
import './App.css';

type MobileTab = 'known' | 'target' | 'result';

const App: React.FC = () => {
  const [knownQuantities, setKnownQuantities] = useState<string[]>([]);
  const [targetQuantities, setTargetQuantities] = useState<string[]>([]);
  const [graphDimensions, setGraphDimensions] = useState({ width: 600, height: 400 });
  const [activeTab, setActiveTab] = useState<MobileTab>('known');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [graphExpanded, setGraphExpanded] = useState(false);
  const graphContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (graphContainerRef.current) {
        const { clientWidth, clientHeight } = graphContainerRef.current;
        setGraphDimensions({
          width: clientWidth || 600,
          height: clientHeight || 400
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // 移动端 Tab 图标
  const tabIcons: Record<MobileTab, string> = {
    known: '📝',
    target: '🎯',
    result: '📊'
  };

  const tabLabels: Record<MobileTab, string> = {
    known: '已知量',
    target: '目标量',
    result: '推导'
  };

  // 移动端布局
  if (isMobile) {
    return (
      <div className="app mobile">
        <header className="app-header">
          {/* <h1>⚛️ PhysFlow</h1> */}
          <h1><img src={logoSvg} alt="PhysFlow" className="title-icon"/>PhysFlow</h1>
          <div className="header-actions">
            <button onClick={swapSelections} disabled={knownQuantities.length === 0 && targetQuantities.length === 0}>
              ⇄
            </button>
            <button onClick={clearAll} disabled={knownQuantities.length === 0 && targetQuantities.length === 0}>
              ✕
            </button>
          </div>
        </header>

        <main className="main-content">
          {/* 图谱区域 - 可折叠 */}
          <div className={`graph-section mobile ${graphExpanded ? 'expanded' : ''}`}>
            <div className="graph-header" onClick={() => setGraphExpanded(!graphExpanded)}>
              <span>推导图谱</span>
              <span className="toggle-icon">{graphExpanded ? '▼' : '▲'}</span>
            </div>
            <div className="graph-container" ref={graphContainerRef}>
              <DerivationGraph
                nodes={graphData.nodes}
                links={graphData.links}
                width={graphDimensions.width}
                height={graphExpanded ? 300 : 150}
              />
            </div>
          </div>

          {/* Tab 内容区 */}
          <div className="tab-content">
            {activeTab === 'known' && (
              <QuantitySelector
                title="已知量"
                selected={knownQuantities}
                onChange={handleKnownChange}
                excludeIds={targetQuantities}
                color="#4CAF50"
              />
            )}
            {activeTab === 'target' && (
              <QuantitySelector
                title="目标量"
                selected={targetQuantities}
                onChange={handleTargetChange}
                excludeIds={knownQuantities}
                color="#F44336"
              />
            )}
            {activeTab === 'result' && (
              <DerivationSteps
                steps={derivationResult.path}
                success={derivationResult.success}
                knownQuantities={knownQuantities}
                targetQuantities={targetQuantities}
                reason={derivationResult.reason}
              />
            )}
          </div>
        </main>

        {/* 底部 Tab 栏 */}
        <nav className="tab-bar">
          {(['known', 'target', 'result'] as MobileTab[]).map(tab => (
            <button
              key={tab}
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              <span className="tab-icon">{tabIcons[tab]}</span>
              <span className="tab-label">{tabLabels[tab]}</span>
              {tab === 'known' && knownQuantities.length > 0 && (
                <span className="tab-badge">{knownQuantities.length}</span>
              )}
              {tab === 'target' && targetQuantities.length > 0 && (
                <span className="tab-badge">{targetQuantities.length}</span>
              )}
            </button>
          ))}
        </nav>
        <Analytics />
      </div>
    );
  }

  // 桌面端布局
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1><img src={logoSvg} alt="PhysFlow" className="title-icon"/>PhysFlow</h1>
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
              reason={derivationResult.reason}
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
      <Analytics />
    </div>
  );
};

export default App;
