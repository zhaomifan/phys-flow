import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import type { GraphNode, GraphLink } from '../utils/derivationEngine';

interface DerivationGraphProps {
  nodes: GraphNode[];
  links: GraphLink[];
  width: number;
  height: number;
}

interface SimulationNode extends GraphNode, d3.SimulationNodeDatum {
  fx?: number;
  fy?: number;
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  type: 'input' | 'output';
}

const DerivationGraph: React.FC<DerivationGraphProps> = ({ nodes, links, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const simulationNodes: SimulationNode[] = useMemo(() =>
    nodes.map(n => ({ ...n })),
    [nodes]
  );

  const simulationLinks: SimulationLink[] = useMemo(() =>
    links.map(l => ({
      ...l,
      source: l.source,
      target: l.target
    })),
    [links]
  );

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const defs = svg.append('defs');

    defs.append('marker')
      .attr('id', 'arrowhead-input')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#999');

    defs.append('marker')
      .attr('id', 'arrowhead-output')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#FF9800');

    const gradient = defs.append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#4CAF50');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#FF9800');

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<SimulationNode>(simulationNodes)
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(simulationLinks)
        .id(d => d.id)
        .distance(150)
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05));

    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(simulationLinks)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', d => d.type === 'input' ? '#999' : '#FF9800')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => d.type === 'input' ? '5,5' : 'none')
      .attr('marker-end', d => d.type === 'input' ? 'url(#arrowhead-input)' : 'url(#arrowhead-output)')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay((_, i) => i * 100)
      .attr('opacity', 0.7);

    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(simulationNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag<SVGGElement, SimulationNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = undefined;
          d.fy = undefined;
        }));

    node.each(function(d) {
      const el = d3.select(this);

      if (d.type === 'formula') {
        el.append('rect')
          .attr('width', 140)
          .attr('height', 50)
          .attr('x', -70)
          .attr('y', -25)
          .attr('rx', 8)
          .attr('ry', 8)
          .attr('fill', '#1a1a2e')
          .attr('stroke', '#FF9800')
          .attr('stroke-width', 2)
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .delay(300)
          .attr('opacity', 1);

        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#FF9800')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'serif')
          .text(d.symbol.length > 16 ? d.symbol.substring(0, 16) + '...' : d.symbol)
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .delay(500)
          .attr('opacity', 1);
      } else {
        const color = d.type === 'known' ? '#4CAF50' : '#F44336';

        el.append('circle')
          .attr('r', 0)
          .attr('fill', '#1a1a2e')
          .attr('stroke', color)
          .attr('stroke-width', 3)
          .transition()
          .duration(500)
          .delay(200)
          .attr('r', 30);

        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', color)
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .text(d.symbol)
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .delay(400)
          .attr('opacity', 1);

        el.append('text')
          .attr('text-anchor', 'middle')
          .attr('y', 42)
          .attr('fill', '#888')
          .attr('font-size', '10px')
          .text(d.label)
          .attr('opacity', 0)
          .transition()
          .duration(500)
          .delay(500)
          .attr('opacity', 1);
      }
    });

    node.append('title')
      .text(d => `${d.label}\n${d.symbol}${d.unit ? ' (' + d.unit + ')' : ''}`);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimulationNode).x || 0)
        .attr('y1', d => (d.source as SimulationNode).y || 0)
        .attr('x2', d => (d.target as SimulationNode).x || 0)
        .attr('y2', d => (d.target as SimulationNode).y || 0);

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height, simulationNodes, simulationLinks]);

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
