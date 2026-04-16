'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Bell, Download, Share2, ChevronDown, Calendar, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDateRange, RANGES } from './DateRangeContext';

export function TopBar({ title }: { title: string; subtitle?: string }) {
  const [time, setTime] = useState('');
  const [rangeOpen, setRangeOpen] = useState(false);
  const { range, meta, setRange } = useDateRange();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleString('en-MY', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current?.contains(e.target as Node)) setRangeOpen(false);
    }
    if (rangeOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [rangeOpen]);

  return (
    <header className="bayu-topbar sticky top-0 z-20 flex h-[72px] items-center gap-4 border-b border-bayu-line bg-bayu-bg0/80 px-8 backdrop-blur-xl">
      {/* Title */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-bayu-textDim">
          <span>Sabah Tourism Board</span>
          <span className="h-1 w-1 rounded-full bg-bayu-textDim" />
          <span className="text-bayu-sky">Live</span>
        </div>
        <h1 className="truncate font-display text-xl font-bold text-bayu-text">{title}</h1>
      </div>

      {/* Search */}
      <div className="relative hidden w-[300px] xl:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bayu-textDim" />
        <input
          type="text"
          placeholder="Search districts, markets, reports…"
          className="w-full rounded-lg border border-bayu-line bg-bayu-bg1/70 py-2 pl-10 pr-10 text-sm text-bayu-text placeholder-bayu-textDim outline-none transition focus:border-bayu-sky focus:ring-2 focus:ring-bayu-sky/20"
        />
        <kbd className="absolute right-3 top-1/2 flex h-5 -translate-y-1/2 items-center rounded border border-bayu-line bg-bayu-bg2 px-1.5 text-[10px] font-semibold text-bayu-textDim">
          ⌘K
        </kbd>
      </div>

      {/* Date range */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setRangeOpen((o) => !o)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
            rangeOpen
              ? 'border-bayu-sky bg-bayu-bg2 text-bayu-text'
              : 'border-bayu-line bg-bayu-bg1/70 text-bayu-textMuted hover:bg-bayu-bg2 hover:text-bayu-text'
          }`}
        >
          <Calendar className="h-4 w-4 text-bayu-sky" />
          <span>{meta.label}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition ${rangeOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {rangeOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full z-40 mt-2 w-56 overflow-hidden rounded-lg border border-bayu-line bg-bayu-bg1 shadow-2xl"
            >
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => {
                    setRange(r.key);
                    setRangeOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-xs transition ${
                    range === r.key
                      ? 'bg-bayu-ocean/15 text-bayu-text'
                      : 'text-bayu-textMuted hover:bg-bayu-bg2 hover:text-bayu-text'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{r.label}</span>
                    <span className="text-[10px] text-bayu-textDim">{r.humanLabel}</span>
                  </div>
                  {range === r.key && <Check className="h-3.5 w-3.5 text-bayu-sky" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Export */}
      <button className="flex items-center gap-2 rounded-lg border border-bayu-line bg-bayu-bg1/70 px-3 py-2 text-xs font-medium text-bayu-textMuted transition hover:bg-bayu-bg2 hover:text-bayu-text">
        <Download className="h-4 w-4" />
        <span>Export</span>
      </button>

      {/* Share */}
      <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-bayu-ocean to-bayu-sky px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-bayu-ocean/30 transition hover:shadow-bayu-ocean/50">
        <Share2 className="h-4 w-4" />
        <span>Share Report</span>
      </button>

      {/* Notifications */}
      <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-bayu-line bg-bayu-bg1/70 text-bayu-textMuted transition hover:bg-bayu-bg2 hover:text-bayu-text">
        <Bell className="h-4 w-4" />
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-bayu-coral px-1 text-[9px] font-bold text-white">
          7
        </span>
      </button>

      {/* Time */}
      <div className="hidden border-l border-bayu-line pl-4 text-right 2xl:block">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">Last sync</div>
        <div className="text-xs font-medium text-bayu-text">{time}</div>
      </div>
    </header>
  );
}
