'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export type DateRange = '7d' | '30d' | '90d' | 'ytd' | 'custom';

export interface DateRangeMeta {
  key: DateRange;
  label: string;
  multiplier: number; // scales visitor/revenue data, proportional to time window
  humanLabel: string;
}

export const RANGES: DateRangeMeta[] = [
  { key: '7d',     label: 'Last 7 days',   multiplier: 0.028, humanLabel: 'Past week' },
  { key: '30d',    label: 'Last 30 days',  multiplier: 0.109, humanLabel: 'Past month' },
  { key: '90d',    label: 'Last 90 days',  multiplier: 0.328, humanLabel: 'Past quarter' },
  { key: 'ytd',    label: 'YTD 2026',      multiplier: 1.0,   humanLabel: 'Year-to-date' },
  { key: 'custom', label: 'Custom range',  multiplier: 0.75,  humanLabel: 'Custom · 274 days' },
];

interface DateRangeContextValue {
  range: DateRange;
  meta: DateRangeMeta;
  setRange: (r: DateRange) => void;
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<DateRange>('ytd');
  const meta = RANGES.find((r) => r.key === range) ?? RANGES[3];
  return (
    <DateRangeContext.Provider value={{ range, meta, setRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}

export function useDateRange() {
  const ctx = useContext(DateRangeContext);
  // Default meta if no provider (won't happen in practice)
  if (!ctx) return { range: 'ytd' as DateRange, meta: RANGES[3], setRange: () => {} };
  return ctx;
}

/** Scale a baseline (YTD) number to the currently-selected range. */
export function useScaled(n: number) {
  const { meta } = useDateRange();
  return Math.round(n * meta.multiplier);
}
