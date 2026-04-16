'use client';

import { LiveDot } from './LiveCounter';

export function Section({
  title,
  subtitle,
  kicker,
  live,
  action,
  children,
  className = '',
  padding = true,
}: {
  title: string;
  subtitle?: string;
  kicker?: string;
  live?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <section
      className={`rounded-2xl border border-bayu-line bg-bayu-bg1 transition hover:border-bayu-line2 ${
        padding ? 'p-6' : ''
      } ${className}`}
    >
      <header className={`flex items-start justify-between gap-4 ${padding ? 'mb-5' : 'p-6 pb-4'}`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base font-bold text-bayu-text">{title}</h2>
            {live && <LiveDot size="xs" color="coral" />}
          </div>
          {subtitle && <p className="mt-0.5 text-xs text-bayu-textMuted">{subtitle}</p>}
        </div>
        {(kicker || action) && (
          <div className="flex shrink-0 items-center gap-2">
            {kicker && (
              <div className="rounded-md border border-bayu-line bg-bayu-bg2/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-bayu-textMuted">
                {kicker}
              </div>
            )}
            {action}
          </div>
        )}
      </header>
      <div className={padding ? '' : 'px-6 pb-6'}>{children}</div>
    </section>
  );
}
