import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { Brain, Sparkles } from 'lucide-react';

interface DataPoint {
  x: number;
  y: number;
  id: string;
}

export default function HealthCorrelationViz() {
  const svgRef = useRef<SVGSVGElement>(null);

  // Static correlation data for health metrics mapping
  const generateData = (): DataPoint[] => {
    return Array.from({ length: 40 }, (_, i) => ({
      x: 60 + Math.random() * 40, // HR: 60-100
      y: 90 + Math.random() * 10, // Oxygen: 90-100
      id: `dp-${i}`
    }));
  };

  useEffect(() => {
    if (!svgRef.current) return;

    const data = generateData();
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // SCALES
    const x = d3.scaleLinear()
      .domain([55, 105])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([85, 100])
      .range([height, 0]);

    // AXES
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .attr('font-size', '10px')
      .attr('font-weight', '800')
      .style('color', '#94a3b8')
      .selectAll('path, line').style('stroke', '#f1f5f9');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .attr('font-size', '10px')
      .attr('font-weight', '800')
      .style('color', '#94a3b8')
      .selectAll('path, line').style('stroke', '#f1f5f9');

    // DOTS
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.x))
      .attr('cy', d => y(d.y))
      .attr('r', 0)
      .attr('fill', '#3b82f6')
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 12)
          .attr('fill-opacity', 1)
          .attr('fill', '#2563eb');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 8)
          .attr('fill-opacity', 0.6)
          .attr('fill', '#3b82f6');
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 20)
      .attr('r', 8);

    // REGRESSION LINE (Simplified for viz)
    const line = d3.line<DataPoint>()
      .x(d => x(d.x))
      .y(d => y(d.y));

    // Sort for line
    const sortedData = [...data].sort((a, b) => a.x - b.x);

    svg.append('path')
      .datum(sortedData)
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '5,5')
      .attr('d', line);

    // Labels
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '900')
      .attr('fill', '#1e293b')
      .attr('text-transform', 'uppercase')
      .text('Heart Rate (BPM)');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('font-weight', '900')
      .attr('fill', '#1e293b')
      .attr('text-transform', 'uppercase')
      .text('Oxygen Saturation (%)');

  }, []);

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Biometric Correlation Analysis</h3>
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">D3.js Health Mapping</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
           <Sparkles className="w-3 h-3" />
           Insight Detected
        </div>
      </div>
      
      <div className="relative w-full aspect-[4/3] max-h-[400px]">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      <div className="mt-8 pt-8 border-t border-slate-50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 shadow-2xl" />
          </div>
          <div>
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cortex observation</div>
             <p className="text-sm text-slate-600 font-medium leading-relaxed">
               Health correlation between <span className="text-blue-600 font-black">Heart Rate</span> and <span className="text-indigo-600 font-black">Oxygen</span> shows a stable 88% efficiency. No recovery anomalies detected.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
