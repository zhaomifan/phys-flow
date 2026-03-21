import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphLink } from '../utils/derivationEngine';

interface DerivationGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  width: number;
  height: number;
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  symbol: string;
  unit: string;
  type: 'known' | 'formula' | 'target' | 'derived';
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  type: 'input' | 'output';
}

const DerivationGraph: React.FC<DerivationGraphProps> = ({ nodes, links, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    // 停止之前的 simulation
    if (simRef.current) {
      simRef.current.stop();
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // 准备数据
    const simNodes: SimNode[] = nodes.map(n => ({ ...n }));
    const simLinks: SimLink[] = links.map(l => ({ ...l, source: l.source, target: l.target }));

    // 定义箭头
    const defs = svg.append('defs');
    defs.append('marker')
      .attr('id', 'arrow-in')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#666');

    defs.append('marker')
      .attr('id', 'arrow-out')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 28)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L10,0L0,4')
      .attr('fill', '#FF9800');

    const g = svg.append('g');

    // 缩放
    svg.call(d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (e) => g.attr('transform', e.transform)));

    // 创建 simulation
    const simulation = d3.forceSimulation<SimNode, SimLink>(simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(simLinks)
        .id(d => d.id)
        .distance(180))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius(70))
      .alphaDecay(0.02);

    simRef.current = simulation;

    // 绘制连线
    const linkGroup = g.append('g').attr('class', 'links');
    const linkSel = linkGroup.selectAll<SVGLineElement, SimLink>('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', d => d.type === 'input' ? '#555' : '#FF9800')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => d.type === 'input' ? '6,4' : 'none')
      .attr('marker-end', d => d.type === 'input' ? 'url(#arrow-in)' : 'url(#arrow-out)');

    // 绘制节点
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeSel = nodeGroup.selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (e, d) => {
          if (!e.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (e, d) => {
          d.fx = e.x;
          d.fy = e.y;
        })
        .on('end', (e, d) => {
          if (!e.active) simulation.alphaTarget(0);
          d.fx = undefined;
          d.fy = undefined;
        }));

    // 为每个节点添加形状
    nodeSel.each(function(d) {
      const el = d3.select(this);

      if (d.type === 'formula') {
        // 公式节点：矩形
        el.append('rect')
          .attr('width', 150)
          .attr('height', 50)
          .attr('x', -75)
          .attr('y', -25)
          .attr('rx', 8)
          .attr('fill', '#1e1e2e')
          .attr('stroke', '#FF9800')
          .attr('stroke-width', 2);

        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#FF9800')
          .attr('font-size', '12px')
          .attr('font-weight', '600')
          .attr('font-family', 'serif')
          .text(d.symbol.length > 18 ? d.symbol.substring(0, 18) + '...' : d.symbol);
      } else {
        // 物理量节点：圆形
        const colors: Record<string, string> = {
          known: '#4CAF50',
          target: '#F44336',
          derived: '#2196F3'
        };
        const color = colors[d.type] || '#888';

        el.append('circle')
          .attr('r', 32)
          .attr('fill', '#1e1e2e')
          .attr('stroke', color)
          .attr('stroke-width', 3);

        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', color)
          .attr('font-size', '16px')
          .attr('font-weight', 'bold')
          .text(d.symbol);

        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', 45)
          .attr('fill', '#888')
          .attr('font-size', '10px')
          .text(d.label);
      }
    });

    // Tooltip
    nodeSel.append('title')
      .text(d => `${d.label} (${d.symbol})${d.unit ? '\n单位: ' + d.unit : ''}`);

    // Tick 更新位置
    simulation.on('tick', () => {
      linkSel
        .attr('x1', d => (d.source as SimNode).x ?? 0)
        .attr('y1', d => (d.source as SimNode).y ?? 0)
        .attr('x2', d => (d.target as SimNode).x ?? 0)
        .attr('y2', d => (d.target as SimNode).y ?? 0);

      nodeSel.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // 清理
    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height]);

  if (nodes.length === 0) {
    return (
      <div className="graph-placeholder">
        <div className="placeholder-icon">📊</div>
        <p>选择已知量和目标量开始推导</p>
      </div>
    );
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="derivation-graph"
    />
  );
};

export default DerivationGraph;
