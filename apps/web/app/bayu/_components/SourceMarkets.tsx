'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import { stats } from '../_data/stats';

type SortKey = 'visitors' | 'growth' | 'avgSpend';

export function SourceMarkets() {
  const [sort, setSort] = useState<SortKey>('visitors');

  const sorted = [...stats.sourceMarkets].sort((a, b) => b[sort] - a[sort]);
  const max = Math.max(...sorted.map((m) => m.visitors));

  return (
    <div>
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 border-b border-bayu-line pb-2 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
        <div className="col-span-1">#</div>
        <div className="col-span-4">Market</div>
        <HeaderCell label="Visitors" sortKey="visitors" current={sort} onSort={setSort} cols="col-span-3" />
        <HeaderCell label="YoY" sortKey="growth" current={sort} onSort={setSort} cols="col-span-2" />
        <HeaderCell label="Avg Spend" sortKey="avgSpend" current={sort} onSort={setSort} cols="col-span-2 text-right" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-bayu-line/50">
        {sorted.map((m, i) => {
          const pct = (m.visitors / max) * 100;
          const positive = m.growth >= 0;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="group grid grid-cols-12 items-center gap-2 py-3 text-sm transition hover:bg-bayu-bg2/40"
            >
              <div className="col-span-1 text-bayu-textDim">{i + 1}</div>

              <div className="col-span-4 flex items-center gap-3">
                <span className="text-2xl leading-none">{m.flag}</span>
                <div className="min-w-0">
                  <div className="truncate font-medium text-bayu-text">{m.country}</div>
                  <div className="text-[10px] text-bayu-textDim">
                    {((m.visitors / stats.totalVisitors) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>

              <div className="col-span-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold text-bayu-text tabular-nums">
                    {(m.visitors / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-bayu-bg2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.2 + i * 0.03, duration: 0.7 }}
                    className="h-full rounded-full bg-gradient-to-r from-bayu-ocean to-bayu-sky"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <span
                  className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-bold ${
                    positive ? 'bg-bayu-jungle/15 text-bayu-jungle' : 'bg-bayu-coral/15 text-bayu-coral'
                  }`}
                >
                  {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {positive ? '+' : ''}
                  {m.growth.toFixed(1)}%
                </span>
              </div>

              <div className="col-span-2 text-right">
                <div className="font-display text-sm font-semibold text-bayu-text tabular-nums">
                  RM {m.avgSpend.toLocaleString('en-MY')}
                </div>
                <div className="text-[10px] text-bayu-textDim">per visitor</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function HeaderCell({
  label,
  sortKey,
  current,
  onSort,
  cols,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  onSort: (k: SortKey) => void;
  cols: string;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 transition hover:text-bayu-text ${cols} ${
        active ? 'text-bayu-sky' : ''
      }`}
    >
      {label}
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );
}
