'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { stats } from '../_data/stats';

export function MonthlyTrend() {
  const data = stats.monthlyTrend;
  const maxV = Math.max(...data.map((d) => d.visitors));
  const maxR = Math.max(...data.map((d) => d.revenue));
  const [hover, setHover] = useState<number | null>(null);

  const width = 720;
  const height = 260;
  const padL = 40;
  const padR = 40;
  const padT = 20;
  const padB = 36;
  const chartW = width - padL - padR;
  const chartH = height - padT - padB;
  const step = chartW / data.length;

  const linePts = data.map((d, i) => ({
    x: padL + i * step + step / 2,
    y: padT + chartH - (d.revenue / maxR) * chartH,
  }));
  const linePath = 'M ' + linePts.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ');
  const areaPath = linePath + ` L ${linePts[linePts.length - 1].x} ${padT + chartH} L ${linePts[0].x} ${padT + chartH} Z`;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-auto"
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2EAFE8" stopOpacity="1" />
            <stop offset="100%" stopColor="#096DBB" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F7B731" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F7B731" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              x1={padL}
              y1={padT + chartH * (1 - t)}
              x2={padL + chartW}
              y2={padT + chartH * (1 - t)}
              stroke="#1F3A5F"
              strokeWidth={0.5}
              strokeDasharray={t === 0 ? '' : '2 4'}
            />
            <text
              x={padL - 6}
              y={padT + chartH * (1 - t) + 3}
              fontSize={9}
              fill="#5A7394"
              textAnchor="end"
            >
              {Math.round((maxV * t) / 1000)}K
            </text>
            <text
              x={padL + chartW + 6}
              y={padT + chartH * (1 - t) + 3}
              fontSize={9}
              fill="#5A7394"
              textAnchor="start"
            >
              {Math.round(maxR * t)}M
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const bw = step * 0.55;
          const x = padL + i * step + (step - bw) / 2;
          const h = (d.visitors / maxV) * chartH;
          const y = padT + chartH - h;
          return (
            <motion.rect
              key={d.month}
              initial={{ height: 0, y: padT + chartH }}
              animate={{ height: h, y }}
              transition={{ delay: i * 0.04, duration: 0.6, ease: 'easeOut' }}
              x={x}
              width={bw}
              rx={3}
              fill="url(#barGrad)"
              opacity={hover === null || hover === i ? 1 : 0.4}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            />
          );
        })}

        {/* Revenue area */}
        <motion.path
          d={areaPath}
          fill="url(#areaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        />
        <motion.path
          d={linePath}
          stroke="#F7B731"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 1.2 }}
          style={{ filter: 'drop-shadow(0 0 4px rgba(247,183,49,0.6))' }}
        />

        {/* Revenue dots */}
        {linePts.map((p, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 5 : 3}
            fill="#F7B731"
            stroke="#070F1E"
            strokeWidth={1.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.03 }}
            style={{ cursor: 'pointer', filter: 'drop-shadow(0 0 3px rgba(247,183,49,0.8))' }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}

        {/* X labels */}
        {data.map((d, i) => (
          <text
            key={`label-${d.month}`}
            x={padL + i * step + step / 2}
            y={height - 12}
            fontSize={10}
            fill="#8FA3B8"
            textAnchor="middle"
            fontWeight={hover === i ? 700 : 500}
          >
            {d.month}
          </text>
        ))}

        {/* Hover tooltip */}
        {hover !== null && (
          <g>
            <line
              x1={padL + hover * step + step / 2}
              y1={padT}
              x2={padL + hover * step + step / 2}
              y2={padT + chartH}
              stroke="#E6EEF7"
              strokeWidth={0.6}
              strokeDasharray="2 3"
              opacity={0.5}
            />
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {hover !== null && (
        <div
          className="pointer-events-none absolute rounded-lg border border-bayu-line bg-bayu-bg0/95 p-3 shadow-2xl backdrop-blur"
          style={{
            left: `${((padL + hover * step + step / 2) / width) * 100}%`,
            top: 8,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
            {data[hover].month} 2026
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm bg-bayu-sky" />
            <span className="text-xs text-bayu-textMuted">Visitors</span>
            <span className="ml-auto text-xs font-bold text-bayu-text">
              {data[hover].visitors.toLocaleString('en-MY')}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm bg-bayu-gold" />
            <span className="text-xs text-bayu-textMuted">Revenue</span>
            <span className="ml-auto text-xs font-bold text-bayu-gold">
              RM {data[hover].revenue}M
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded bg-bayu-sky" />
          <span className="text-bayu-textMuted">Visitors</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-5 bg-bayu-gold" />
          <span className="text-bayu-textMuted">Revenue (RM M)</span>
        </div>
      </div>
    </div>
  );
}
