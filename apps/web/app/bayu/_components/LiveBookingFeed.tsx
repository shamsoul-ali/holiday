'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { stats } from '../_data/stats';
import { LiveDot } from './LiveCounter';

const tierColor: Record<string, string> = {
  budget: '#10B981',
  comfort: '#2EAFE8',
  luxury: '#F7B731',
};

export function LiveBookingFeed() {
  const [cursor, setCursor] = useState(0);
  const [bookings, setBookings] = useState(stats.liveBookings);

  useEffect(() => {
    const id = setInterval(() => {
      setCursor((c) => c + 1);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const visible = Array.from({ length: 6 }).map((_, offset) => {
    const b = bookings[(cursor + offset) % bookings.length];
    return { ...b, renderId: `${b.id}-${cursor}-${offset}` };
  });

  const totalToday = bookings.reduce((a, b) => a + b.amount, 0) * 37;
  const countToday = 1847;

  return (
    <div className="rounded-2xl border border-bayu-line bg-bayu-bg1">
      <div className="flex items-center justify-between border-b border-bayu-line px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-bayu-text">Live Booking Feed</h3>
            <LiveDot size="sm" color="coral" />
          </div>
          <p className="mt-0.5 text-[11px] text-bayu-textMuted">
            Real-time bookings across all operators
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
            Today
          </div>
          <div className="font-display text-base font-bold text-bayu-text tabular-nums">
            {countToday.toLocaleString('en-MY')}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden p-3" style={{ height: 436 }}>
        <AnimatePresence initial={false}>
          {visible.map((b, i) => (
            <motion.div
              key={b.renderId}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: i === 0 ? 1 : 0.95 - i * 0.1, y: i * 70 }}
              exit={{ opacity: 0, y: 200 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i === 0 ? 0 : 0 }}
              className="absolute left-3 right-3 flex items-center gap-3 rounded-lg border border-bayu-line/80 bg-bayu-bg2/60 p-3"
            >
              <div
                className="h-10 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: tierColor[b.tier] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg leading-none">{b.flag}</span>
                  <span className="truncate text-sm font-semibold text-bayu-text">
                    {b.name}
                  </span>
                  <span className="text-[10px] text-bayu-textDim">· {b.from}</span>
                </div>
                <div className="mt-0.5 truncate text-xs text-bayu-textMuted">{b.package}</div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className="font-display text-sm font-bold tabular-nums"
                  style={{ color: tierColor[b.tier] }}
                >
                  RM {b.amount.toLocaleString('en-MY')}
                </div>
                <div className="text-[10px] text-bayu-textDim">{b.minutesAgo}m ago</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-bayu-bg1 to-transparent" />
      </div>

      <div className="border-t border-bayu-line px-5 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-bayu-textMuted">Today's GMV</span>
          <span className="font-display text-sm font-bold text-bayu-gold tabular-nums">
            RM {(totalToday / 1_000_000).toFixed(2)}M
          </span>
        </div>
      </div>
    </div>
  );
}
