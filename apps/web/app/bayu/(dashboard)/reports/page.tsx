'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Star,
  Filter,
  BarChart3,
  Leaf,
  ShieldCheck,
  Users2,
  Briefcase,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import { TopBar } from '../../_components/TopBar';

interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  date: string;
  size: string;
  formats: ('PDF' | 'XLSX' | 'DOCX' | 'CSV')[];
  author: string;
  pinned?: boolean;
}

type ReportCategory =
  | 'All'
  | 'Tourism Stats'
  | 'Economic Impact'
  | 'Sustainability'
  | 'Operator Audit'
  | 'Ministerial Briefings';

const CATEGORIES: { key: ReportCategory; icon: LucideIcon; color: string }[] = [
  { key: 'All',                    icon: Filter,       color: '#2EAFE8' },
  { key: 'Tourism Stats',          icon: BarChart3,    color: '#2EAFE8' },
  { key: 'Economic Impact',        icon: Briefcase,    color: '#F7B731' },
  { key: 'Sustainability',         icon: Leaf,         color: '#10B981' },
  { key: 'Operator Audit',         icon: ShieldCheck,  color: '#A78BFA' },
  { key: 'Ministerial Briefings',  icon: Users2,       color: '#F5362F' },
];

const REPORTS: Report[] = [
  { id: 'r1', title: 'Executive Dashboard — Q1 2026', description: 'Full dashboard snapshot for cabinet review', category: 'Ministerial Briefings', date: '14 Apr 2026', size: '4.2 MB', formats: ['PDF'], author: 'Bayu AI · auto-generated', pinned: true },
  { id: 'r2', title: 'Sabah Tourism YTD Performance 2026', description: 'Arrivals, revenue, occupancy, source markets · year-to-date', category: 'Tourism Stats', date: '12 Apr 2026', size: '2.8 MB', formats: ['PDF', 'XLSX'], author: 'Statistics Division' },
  { id: 'r3', title: 'Economic Impact of Tourism in Sabah 2025', description: 'GDP contribution, employment multipliers, FX inflow analysis', category: 'Economic Impact', date: '28 Mar 2026', size: '6.4 MB', formats: ['PDF', 'XLSX'], author: 'Economic Research Division' },
  { id: 'r4', title: 'Sustainability Scorecard — Q1 2026', description: 'Carbon offset, reef protection, local employment · 78/100 composite', category: 'Sustainability', date: '10 Apr 2026', size: '3.1 MB', formats: ['PDF'], author: 'Sustainability Office' },
  { id: 'r5', title: 'Licensed Operators Compliance Audit', description: '342 operators · 83% compliant · 9 lapsed cases flagged', category: 'Operator Audit', date: '8 Apr 2026', size: '1.9 MB', formats: ['PDF', 'CSV'], author: 'Regulatory Affairs' },
  { id: 'r6', title: 'Source Market Deep Dive — China', description: '28.1% YoY growth · Beijing direct route impact · Xiaohongshu trends', category: 'Tourism Stats', date: '6 Apr 2026', size: '5.2 MB', formats: ['PDF', 'XLSX'], author: 'Market Intelligence' },
  { id: 'r7', title: 'Sabah MICE Tourism Outlook 2026-2028', description: 'Convention centre capacity, bidding pipeline, competitor analysis', category: 'Economic Impact', date: '2 Apr 2026', size: '4.8 MB', formats: ['PDF', 'DOCX'], author: 'MICE Bureau' },
  { id: 'r8', title: 'Sipadan Permit Utilization Report', description: 'Daily quota analysis · 120 permits/day · 94% avg utilization', category: 'Sustainability', date: '1 Apr 2026', size: '2.2 MB', formats: ['PDF', 'XLSX'], author: 'Marine Parks Dept' },
  { id: 'r9', title: 'Ministerial Briefing — Tourism Infrastructure', description: 'BKI expansion, jetty upgrades, eco-resort pipeline · RM 1.2B', category: 'Ministerial Briefings', date: '28 Mar 2026', size: '3.6 MB', formats: ['PDF'], author: 'Minister\'s Office' },
  { id: 'r10', title: 'Hotel Occupancy & ADR Monthly — Mar 2026', description: '84% state-wide · RM 482 RevPAR · +11.2% YoY', category: 'Tourism Stats', date: '2 Apr 2026', size: '1.6 MB', formats: ['XLSX', 'CSV'], author: 'Statistics Division' },
  { id: 'r11', title: 'Mt Kinabalu Climb Safety & Environment Audit', description: 'Q1 trail condition, waste removal, climber incident log', category: 'Operator Audit', date: '24 Mar 2026', size: '2.9 MB', formats: ['PDF'], author: 'Parks Enforcement' },
  { id: 'r12', title: 'Carbon Footprint per Tourist — 2025', description: '3.4 t CO₂e avg · offset program performance · target 2.8 t by 2028', category: 'Sustainability', date: '20 Mar 2026', size: '4.1 MB', formats: ['PDF', 'XLSX'], author: 'Sustainability Office' },
  { id: 'r13', title: 'Homestay Network Performance 2025', description: '840 homestays · Tambunan, Kiulu, Kudat regions · community impact', category: 'Economic Impact', date: '15 Mar 2026', size: '3.4 MB', formats: ['PDF'], author: 'Community Tourism' },
  { id: 'r14', title: 'Dive Operator Safety Compliance — Q1 2026', description: 'All Sabah dive operators, DAN audit results, incident trend', category: 'Operator Audit', date: '10 Mar 2026', size: '2.4 MB', formats: ['PDF', 'CSV'], author: 'Marine Safety' },
  { id: 'r15', title: 'APAC Competitor Benchmark — 2026 Positioning', description: 'Sabah vs. Bali / Phuket / Boracay · spend, stay, sustainability', category: 'Economic Impact', date: '5 Mar 2026', size: '5.8 MB', formats: ['PDF', 'XLSX'], author: 'Strategic Planning' },
];

const formatIcon: Record<string, string> = { PDF: '📄', XLSX: '📊', DOCX: '📝', CSV: '📋' };

export default function ReportsPage() {
  const [category, setCategory] = useState<ReportCategory>('All');
  const [toast, setToast] = useState<string | null>(null);

  const visible = category === 'All' ? REPORTS : REPORTS.filter((r) => r.category === category);
  const pinned = REPORTS.filter((r) => r.pinned);

  function handleDownload(r: Report, fmt: string) {
    setToast(`${r.title} · ${fmt} · generating…`);
    setTimeout(() => setToast(null), 2600);
  }

  return (
    <>
      <TopBar title="Report Library" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
          {/* Pinned hero */}
          {pinned.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl border border-bayu-gold/40 bg-gradient-to-br from-bayu-bg1 via-bayu-bg2 to-bayu-bg1 p-6">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                  background:
                    'radial-gradient(500px 200px at 10% 10%, rgba(247,183,49,0.3), transparent 60%)',
                }}
              />
              <div className="relative flex items-start gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-bayu-gold to-bayu-goldlight shadow-lg shadow-bayu-gold/30">
                  <Star className="h-7 w-7 text-bayu-bg0" strokeWidth={2.5} fill="currentColor" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bayu-gold">
                    Featured · generated nightly
                  </div>
                  <h2 className="mt-0.5 font-display text-xl font-bold text-bayu-text">
                    {pinned[0].title}
                  </h2>
                  <p className="mt-1 text-sm text-bayu-textMuted">{pinned[0].description}</p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-bayu-textDim">
                    <span>{pinned[0].date}</span>
                    <span>·</span>
                    <span>{pinned[0].size}</span>
                    <span>·</span>
                    <span>{pinned[0].author}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(pinned[0], 'PDF')}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-bayu-gold to-bayu-goldlight px-4 py-2.5 text-sm font-bold text-bayu-bg0 shadow-lg shadow-bayu-gold/30 transition hover:shadow-bayu-gold/60"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </div>
          )}

          {/* Category filter + library */}
          <div className="grid grid-cols-12 gap-6">
            {/* Category rail */}
            <aside className="col-span-12 md:col-span-3">
              <div className="rounded-xl border border-bayu-line bg-bayu-bg1 p-4">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
                  Categories
                </h3>
                <div className="space-y-1">
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    const active = category === c.key;
                    const count =
                      c.key === 'All'
                        ? REPORTS.length
                        : REPORTS.filter((r) => r.category === c.key).length;
                    return (
                      <button
                        key={c.key}
                        onClick={() => setCategory(c.key)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                          active
                            ? 'bg-bayu-ocean/20 text-bayu-text'
                            : 'text-bayu-textMuted hover:bg-bayu-bg2/60'
                        }`}
                      >
                        <Icon className="h-4 w-4" style={{ color: c.color }} />
                        <span className="flex-1 text-left">{c.key}</span>
                        <span className="text-[10px] font-bold text-bayu-textDim tabular-nums">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-bayu-line bg-bayu-bg1 p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
                  Library stats
                </h3>
                <dl className="space-y-1.5 text-xs">
                  <StatRow label="Total reports" value={REPORTS.length} />
                  <StatRow label="This quarter"  value={9} />
                  <StatRow label="Auto-generated" value={4} />
                  <StatRow label="Classified"    value={3} />
                </dl>
              </div>
            </aside>

            {/* Report list */}
            <div className="col-span-12 md:col-span-9 space-y-3">
              {visible.map((r, i) => {
                const cat = CATEGORIES.find((c) => c.key === r.category)!;
                const Icon = cat.icon;
                return (
                  <motion.article
                    key={r.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.35 }}
                    className="group flex items-center gap-4 rounded-xl border border-bayu-line bg-bayu-bg1 p-4 transition hover:border-bayu-line2"
                  >
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: cat.color + '1E' }}
                    >
                      <Icon className="h-5 w-5" style={{ color: cat.color }} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-bayu-text">{r.title}</h3>
                        {r.pinned && (
                          <Star className="h-3 w-3 shrink-0 text-bayu-gold" fill="currentColor" />
                        )}
                      </div>
                      <p className="truncate text-xs text-bayu-textMuted">{r.description}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-bayu-textDim">
                        <span
                          className="rounded px-1.5 py-0.5 font-semibold"
                          style={{ color: cat.color, backgroundColor: cat.color + '14' }}
                        >
                          {r.category}
                        </span>
                        <span>·</span>
                        <span>{r.date}</span>
                        <span>·</span>
                        <span>{r.size}</span>
                        <span>·</span>
                        <span className="truncate">{r.author}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {r.formats.map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => handleDownload(r, fmt)}
                          className="flex items-center gap-1 rounded-md border border-bayu-line bg-bayu-bg2/50 px-2 py-1.5 text-[10px] font-bold text-bayu-textMuted transition hover:border-bayu-sky hover:text-bayu-text"
                        >
                          <span>{formatIcon[fmt]}</span>
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-bayu-line bg-bayu-bg1 px-4 py-3 shadow-2xl"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bayu-sky/20">
            <Download className="h-4 w-4 text-bayu-sky" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
              Export queued
            </div>
            <div className="text-sm font-medium text-bayu-text">{toast}</div>
          </div>
        </motion.div>
      )}
    </>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-bayu-textMuted">{label}</dt>
      <dd className="font-display font-bold text-bayu-text tabular-nums">{value}</dd>
    </div>
  );
}
