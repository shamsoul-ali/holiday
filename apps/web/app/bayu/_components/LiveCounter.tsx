'use client';

import { useEffect, useState } from 'react';

export function LiveCounter({
  value,
  ratePerSec,
  className = '',
}: {
  value: number;
  ratePerSec: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    const id = setInterval(() => {
      setDisplay((v) => v + Math.max(1, Math.round(ratePerSec * (0.7 + Math.random() * 0.6))));
    }, 1000);
    return () => clearInterval(id);
  }, [ratePerSec]);

  return (
    <span className={`tabular-nums ${className}`}>{display.toLocaleString('en-MY')}</span>
  );
}

export function LiveDot({
  label = 'LIVE',
  color = 'coral',
  size = 'sm',
}: {
  label?: string;
  color?: 'coral' | 'jungle' | 'sky' | 'gold';
  size?: 'xs' | 'sm' | 'md';
}) {
  const colors: Record<string, string> = {
    coral: '#F5362F',
    jungle: '#10B981',
    sky: '#2EAFE8',
    gold: '#F7B731',
  };
  const dim = size === 'xs' ? 5 : size === 'sm' ? 7 : 9;
  const font = size === 'xs' ? 'text-[9px]' : size === 'sm' ? 'text-[10px]' : 'text-xs';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-flex" style={{ width: dim, height: dim }}>
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping"
          style={{ backgroundColor: colors[color] }}
        />
        <span
          className="relative inline-flex h-full w-full rounded-full"
          style={{ backgroundColor: colors[color] }}
        />
      </span>
      <span
        className={`font-semibold uppercase tracking-[0.2em] ${font}`}
        style={{ color: colors[color] }}
      >
        {label}
      </span>
    </span>
  );
}
