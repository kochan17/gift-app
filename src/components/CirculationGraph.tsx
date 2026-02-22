import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Gift, User } from '../types';

interface CirculationGraphProps {
  users: User[];
  gifts: Gift[];
}

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  avatar: string;
  color: string;
  radius: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value: number;
}

export function CirculationGraph({ users, gifts }: CirculationGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    
    // Initial dimensions
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth > 0 && clientHeight > 0) {
      setDimensions({ width: clientWidth, height: clientHeight });
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    // Prepare data
    const nodes: Node[] = users.map((u) => ({
      ...u,
      radius: 24,
    }));

    // Aggregate gifts between same users to increase link thickness
    const linkMap = new Map<string, Link>();
    gifts.forEach((g) => {
      const key = `${g.senderId}-${g.receiverId}`;
      const weight = 1 + (g.tips * 0.5); // Add tip weight to link thickness
      if (linkMap.has(key)) {
        linkMap.get(key)!.value += weight;
      } else {
        linkMap.set(key, { source: g.senderId, target: g.receiverId, value: weight });
      }
    });
    const links: Link[] = Array.from(linkMap.values());

    const simulation = d3
      .forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id((d) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2 - 40)) // Offset slightly up to account for bottom nav
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + 10));

    // Define arrow markers for directed links
    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 34) // Offset to not overlap with node radius
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.value) * 2)
      .attr('marker-end', 'url(#arrowhead)');

    const nodeGroup = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    // Node circles (background for avatars)
    nodeGroup
      .append('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Clip path for avatars
    nodeGroup
      .append('clipPath')
      .attr('id', (d) => `clip-${d.id}`)
      .append('circle')
      .attr('r', (d) => d.radius);

    // Avatars
    nodeGroup
      .append('image')
      .attr('xlink:href', (d) => d.avatar)
      .attr('x', (d) => -d.radius)
      .attr('y', (d) => -d.radius)
      .attr('width', (d) => d.radius * 2)
      .attr('height', (d) => d.radius * 2)
      .attr('clip-path', (d) => `url(#clip-${d.id})`);

    // Node labels
    nodeGroup
      .append('text')
      .text((d) => d.name)
      .attr('x', 0)
      .attr('y', (d) => d.radius + 12)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('fill', '#4a4a4a');

    simulation.on('tick', () => {
      // Keep nodes within bounds
      nodes.forEach(d => {
        d.x = Math.max(d.radius, Math.min(width - d.radius, d.x!));
        d.y = Math.max(d.radius, Math.min(height - d.radius, d.y!));
      });

      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeGroup.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [users, gifts, dimensions]);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute bottom-24 left-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-black/5 text-center pointer-events-none">
        <p className="text-sm font-medium text-gray-800">
          ギフト循環ネットワーク
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          ノードをドラッグして動かせます。矢印は贈り主から受取人を指しています。
        </p>
      </div>
    </div>
  );
}
