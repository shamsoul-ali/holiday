"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Layers,
  UserX,
  Brain,
  Globe,
  Calculator,
  Heart,
  TrendingUp,
  Shield,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Smartphone,
} from "lucide-react";
import {
  COVER_STATS,
  TAGLINE,
  PAIN_POINTS,
  CAPABILITIES,
  MARKET_TIERS,
  SOM_TARGETS,
  REVENUE_STREAMS,
  WATERFALL,
  KEY_RATIOS,
  COMPETITORS,
  DEFENSIBILITY,
  scalePL,
  grossMargin,
  ebitdaMargin,
  GTM_PHASES,
  MILESTONES_12MO,
  CURRENT_STATUS,
  TEAM_SCALING,
  FUND_ALLOCATIONS,
  calcInvestment,
  calcExitReturns,
  fundsPieGradient,
  TERMS,
  Y3_BASE_REVENUE,
} from "@/lib/budget-data/holidayai";

const TOTAL_SLIDES = 16;

// ── Icon map for pain points ──
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Clock,
  Layers,
  UserX,
  Brain,
  Globe,
  Calculator,
  Heart,
};

// ── Helpers ──

function fmt(n: number, decimals = 1): string {
  if (Math.abs(n) >= 1) return n.toFixed(decimals);
  if (n === 0) return "0.0";
  return n.toFixed(2);
}

function fmtRM(n: number): string {
  if (n >= 1_000_000) return `RM ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `RM ${(n / 1_000).toFixed(0)}K`;
  return `RM ${n.toLocaleString()}`;
}

function pctColor(v: number): string {
  return v >= 0 ? "text-[#059669]" : "text-[#dc2626]";
}

// ── Slide wrapper ──

function Slide({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`h-dvh w-full flex-shrink-0 overflow-y-auto p-4 sm:p-6 ${className}`}
    >
      <div className="max-w-[1400px] w-full min-h-full mx-auto bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_24px_rgba(0,0,0,0.04)] border border-[#e5e7eb]/60 flex items-center justify-center">
        <div className="w-full px-8 sm:px-12 py-10 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Slide Header ──

function SlideHeader({
  tag,
  title,
  subtitle,
}: {
  tag?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center mb-8 sm:mb-10">
      {tag && (
        <span className="inline-block text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[#d97706] py-1.5 px-3 border border-[#d97706]/20 bg-[#d97706]/5 font-[family-name:var(--font-ibm-plex-mono)] mb-4">
          {tag}
        </span>
      )}
      <h2 className="text-[clamp(1.75rem,4vw,3rem)] font-bold bg-gradient-to-r from-[#1e293b] to-[#64748b] bg-clip-text text-transparent font-[family-name:var(--font-space-grotesk)] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#64748b] mt-3 text-[clamp(0.875rem,1.5vw,1.125rem)] max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── Card (white + shadow, replaces glass) ──

function Card({
  children,
  className = "",
  accent,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative bg-white border border-[#e5e7eb] rounded-lg shadow-sm ${className}`}
    >
      {accent && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#059669] to-[#d97706]" />
      )}
      {children}
    </div>
  );
}

// ── Phone mockup placeholder ──

function PhoneMockup({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-[180px] sm:w-[200px] h-[360px] sm:h-[400px] rounded-[2rem] border-2 border-dashed border-[#059669]/40 bg-[#059669]/5 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 rounded-full bg-[#059669]/20" />
        <Smartphone className="w-10 h-10 text-[#059669]/30 mb-3" />
        <p className="text-[#059669] text-xs font-semibold text-center font-[family-name:var(--font-ibm-plex-mono)]">
          {label}
        </p>
        <p className="text-[#94a3b8] text-[10px] text-center mt-1 leading-tight">
          {description}
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════

export default function HolidayAIProposal() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Navigation ──

  const goTo = useCallback(
    (n: number) => setCurrent(Math.max(0, Math.min(TOTAL_SLIDES - 1, n))),
    [],
  );
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        goTo(TOTAL_SLIDES - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, goTo]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
      }
    },
    [next, prev],
  );

  // ── P&L state ──
  const [plMultiplier, setPlMultiplier] = useState(1.0);
  const pl = useMemo(() => scalePL(plMultiplier), [plMultiplier]);

  // ── Investment calc state ──
  const [investAmount, setInvestAmount] = useState(500_000);
  const [valuation, setValuation] = useState(7_000_000);
  const [customMode, setCustomMode] = useState<"pct" | "rm">("pct");
  const [customInput, setCustomInput] = useState("");

  const investCalc = useMemo(
    () => calcInvestment(investAmount, valuation),
    [investAmount, valuation],
  );
  const exitReturns = useMemo(
    () => calcExitReturns(investCalc, Y3_BASE_REVENUE * 1_000_000),
    [investCalc],
  );
  const pieGradient = useMemo(() => fundsPieGradient(FUND_ALLOCATIONS), []);

  // Custom input handler
  const handleCustomInput = useCallback(
    (val: string) => {
      setCustomInput(val);
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) return;
      if (customMode === "pct") {
        // User wants X% → compute RM needed
        const needed = (num / 100) * valuation / (1 - num / 100);
        if (needed >= 200_000 && needed <= 1_000_000) setInvestAmount(Math.round(needed / 50_000) * 50_000);
      } else {
        // User has RM X → just set investment
        if (num >= 200_000 && num <= 1_000_000) setInvestAmount(Math.round(num / 50_000) * 50_000);
      }
    },
    [customMode, valuation],
  );

  // ═══════════════════════════════════════
  // SLIDES
  // ═══════════════════════════════════════

  const slides = [
    // ── 0: Cover ──
    <Slide key="cover" className="relative">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-bold bg-gradient-to-r from-[#059669] via-[#d97706] to-[#0891b7] bg-clip-text text-transparent font-[family-name:var(--font-bebas-neue)] leading-none tracking-wide">
            Holiday AI
          </h1>
        </div>
        <p className="text-[clamp(1rem,2.5vw,1.5rem)] text-[#64748b] mb-4 font-[family-name:var(--font-space-grotesk)]">
          {TAGLINE}
        </p>
        <p className="text-[clamp(0.8rem,1.2vw,1rem)] text-[#94a3b8] mb-12 max-w-xl mx-auto">
          Complete, personalized, bookable travel itineraries in under 60
          seconds. Integrated with 25+ travel APIs, powered by AI.
        </p>
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {COVER_STATS.map((s) => (
            <Card key={s.label} className="px-6 sm:px-8 py-4 sm:py-5" accent>
              <div className="text-[clamp(1.25rem,3vw,2rem)] font-bold bg-gradient-to-r from-[#059669] to-[#d97706] bg-clip-text text-transparent font-[family-name:var(--font-ibm-plex-mono)]">
                {s.value}
              </div>
              <div className="text-[#94a3b8] text-xs sm:text-sm mt-1 font-[family-name:var(--font-ibm-plex-mono)]">
                {s.label}
              </div>
            </Card>
          ))}
        </div>
        <p className="text-[#94a3b8] text-xs mt-12 font-[family-name:var(--font-ibm-plex-mono)]">
          Seed Investment Proposal &mdash; Holiday AI Sdn Bhd
        </p>
      </div>
    </Slide>,

    // ── 1: Problem ──
    <Slide key="problem">
      <SlideHeader
        tag="The Problem"
        title="Travel Planning is Broken"
        subtitle="Travelers waste hours and still end up with suboptimal trips."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PAIN_POINTS.map((p) => {
          const Icon = ICON_MAP[p.icon];
          return (
            <Card key={p.title} className="p-6 sm:p-8" accent>
              {Icon && (
                <div className="w-12 h-12 rounded-lg bg-[#059669]/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#059669]" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-[#1e293b] mb-2 font-[family-name:var(--font-space-grotesk)]">
                {p.title}
              </h3>
              <p className="text-[#64748b] text-sm leading-relaxed">
                {p.description}
              </p>
            </Card>
          );
        })}
      </div>
    </Slide>,

    // ── 2: Solution ──
    <Slide key="solution">
      <SlideHeader
        tag="Our Solution"
        title="AI-Powered Travel for Everyone"
        subtitle="From plan to booking in one seamless experience."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {CAPABILITIES.map((c) => {
          const Icon = ICON_MAP[c.icon];
          return (
            <Card key={c.title} className="p-6" accent>
              <div className="flex items-start gap-4">
                {Icon && (
                  <div className="w-10 h-10 rounded-lg bg-[#d97706]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#d97706]" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-semibold text-[#1e293b] mb-1 font-[family-name:var(--font-space-grotesk)]">
                    {c.title}
                  </h3>
                  <p className="text-[#64748b] text-sm leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Slide>,

    // ── 3: Market ──
    <Slide key="market">
      <SlideHeader
        tag="Market Opportunity"
        title="A $220B+ Market"
        subtitle="Starting with Malaysia, expanding across ASEAN and global Muslim travel."
      />
      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* Concentric circles */}
        <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] flex-shrink-0 mx-auto">
          {MARKET_TIERS.map((t, i) => {
            const size = `${t.size}%`;
            return (
              <div
                key={t.label}
                className="absolute rounded-full flex items-center justify-center"
                style={{
                  width: size,
                  height: size,
                  top: `${(100 - t.size) / 2}%`,
                  left: `${(100 - t.size) / 2}%`,
                  border: `2px solid ${t.color}`,
                  backgroundColor: `${t.color}${i === 2 ? "20" : "10"}`,
                }}
              >
                {i === MARKET_TIERS.length - 1 && (
                  <div className="text-center">
                    <div className="text-xs font-[family-name:var(--font-ibm-plex-mono)] text-[#059669] font-bold">
                      SOM
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {/* Labels outside */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-center">
            <span className="text-xs font-[family-name:var(--font-ibm-plex-mono)] text-[#0891b7]">
              TAM $220B
            </span>
          </div>
          <div className="absolute top-[22%] -right-2 sm:-right-8 text-right">
            <span className="text-xs font-[family-name:var(--font-ibm-plex-mono)] text-[#d97706]">
              SAM $33B
            </span>
          </div>
        </div>
        {/* GMV targets */}
        <div className="flex-1 space-y-4">
          <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)] mb-4">
            GMV Targets
          </h3>
          {SOM_TARGETS.map((t) => (
            <Card key={t.label} className="p-4 flex items-center justify-between">
              <span className="text-[#64748b] text-sm">{t.label}</span>
              <span className="text-lg font-bold font-[family-name:var(--font-ibm-plex-mono)] bg-gradient-to-r from-[#059669] to-[#d97706] bg-clip-text text-transparent">
                {t.value}
              </span>
            </Card>
          ))}
          <p className="text-[#94a3b8] text-xs mt-4">
            Malaysia: 32M population, 95% smartphone penetration, 3.2 leisure
            trips/year avg
          </p>
        </div>
      </div>
    </Slide>,

    // ── 4: Business Model ──
    <Slide key="model">
      <SlideHeader
        tag="Business Model"
        title="5 Revenue Streams"
        subtitle="Marketplace + SaaS hybrid with embedded fintech."
      />
      <div className="space-y-4 max-w-3xl mx-auto">
        {REVENUE_STREAMS.map((r) => (
          <div key={r.label} className="flex items-center gap-4">
            <span className="text-sm text-[#64748b] w-40 sm:w-48 text-right flex-shrink-0 font-[family-name:var(--font-ibm-plex-mono)]">
              {r.label}
            </span>
            <div className="flex-1 h-9 bg-[#f1f5f9] rounded overflow-hidden relative">
              <div
                className="h-full rounded transition-all duration-700 ease-out flex items-center px-3"
                style={{
                  width: `${r.pct}%`,
                  backgroundColor: r.color,
                  opacity: 0.85,
                }}
              >
                <span className="text-xs font-bold font-[family-name:var(--font-ibm-plex-mono)] text-white">
                  {r.pct}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-[#94a3b8] text-xs mt-8 font-[family-name:var(--font-ibm-plex-mono)]">
        Y3 revenue mix target &mdash; 10% blended take rate on GMV
      </p>
    </Slide>,

    // ── 5: Unit Economics ──
    <Slide key="unit-econ">
      <SlideHeader
        tag="Unit Economics"
        title="Per-Trip Waterfall"
        subtitle="Strong contribution margin from day one."
      />
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <Card className="p-6 flex-1" accent>
          <table className="w-full text-sm">
            <tbody>
              {WATERFALL.map((w) => (
                <tr
                  key={w.label}
                  className={
                    w.isSubtotal
                      ? "border-t border-[#e5e7eb] font-bold"
                      : ""
                  }
                >
                  <td className="py-1.5 text-[#64748b] pr-4">
                    {w.label}
                  </td>
                  <td
                    className={`py-1.5 text-right font-[family-name:var(--font-ibm-plex-mono)] ${
                      w.isNegative
                        ? "text-[#dc2626]"
                        : w.isSubtotal
                          ? "text-[#059669]"
                          : "text-[#1e293b]"
                    }`}
                  >
                    {w.isNegative ? "(" : ""}RM{" "}
                    {Math.abs(w.value).toLocaleString()}
                    {w.isNegative ? ")" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <div className="grid grid-cols-2 gap-4 md:w-64">
          {KEY_RATIOS.map((r) => (
            <Card key={r.label} className="p-4 text-center">
              <div className="text-xl font-bold font-[family-name:var(--font-ibm-plex-mono)] bg-gradient-to-r from-[#059669] to-[#d97706] bg-clip-text text-transparent">
                {r.value}
              </div>
              <div className="text-[#94a3b8] text-xs mt-1">{r.label}</div>
            </Card>
          ))}
        </div>
      </div>
    </Slide>,

    // ── 6: Competitive Landscape ──
    <Slide key="competitive">
      <SlideHeader
        tag="Competition"
        title="Competitive Landscape"
        subtitle="We compete on intelligence, not inventory."
      />
      <Card className="p-4 sm:p-6 overflow-x-auto" accent>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-[#e5e7eb]">
              <th className="text-left py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                Competitor
              </th>
              <th className="text-left py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                Their Weakness
              </th>
              <th className="text-left py-2 text-[#059669] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                Holiday AI
              </th>
            </tr>
          </thead>
          <tbody>
            {COMPETITORS.map((c) => (
              <tr key={c.name} className="border-b border-[#e5e7eb]/50">
                <td className="py-2.5 text-[#1e293b] font-medium">
                  {c.name}
                </td>
                <td className="py-2.5 text-[#64748b]">{c.weakness}</td>
                <td className="py-2.5 text-[#059669]">{c.holidayAI}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEFENSIBILITY.map((d) => (
          <div key={d} className="flex items-start gap-2 text-sm">
            <Shield className="w-4 h-4 text-[#d97706] flex-shrink-0 mt-0.5" />
            <span className="text-[#64748b]">{d}</span>
          </div>
        ))}
      </div>
    </Slide>,

    // ── 7: P&L Projection (Interactive) ──
    <Slide key="pnl">
      <SlideHeader
        tag="Financials"
        title="3-Year P&L Projection"
        subtitle="Adjust the growth multiplier to model scenarios."
      />
      {/* Slider */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className="text-xs text-[#94a3b8] font-[family-name:var(--font-ibm-plex-mono)]">
          0.5x
        </span>
        <input
          type="range"
          min={0.5}
          max={2.0}
          step={0.1}
          value={plMultiplier}
          onChange={(e) => setPlMultiplier(parseFloat(e.target.value))}
          className="w-48 sm:w-64"
          style={{ accentColor: "#059669" }}
        />
        <span className="text-xs text-[#94a3b8] font-[family-name:var(--font-ibm-plex-mono)]">
          2.0x
        </span>
        <Card className="px-3 py-1.5 ml-2">
          <span className="text-sm font-bold font-[family-name:var(--font-ibm-plex-mono)] text-[#059669]">
            {plMultiplier.toFixed(1)}x
          </span>
          <span className="text-xs text-[#94a3b8] ml-2">
            {plMultiplier <= 0.7
              ? "Conservative"
              : plMultiplier <= 1.2
                ? "Base"
                : "Aggressive"}
          </span>
        </Card>
      </div>
      {/* Table */}
      <Card className="p-4 sm:p-6 overflow-x-auto" accent>
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-[#e5e7eb]">
              <th className="text-left py-2 text-[#94a3b8] font-normal text-xs w-1/3">
                RM millions
              </th>
              <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                Y1
              </th>
              <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                Y2
              </th>
              <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                Y3
              </th>
            </tr>
          </thead>
          <tbody>
            {pl.map((row) => {
              if (row.type === "spacer")
                return <tr key={row.key} className="h-3" />;
              if (row.type === "header")
                return (
                  <tr key={row.key}>
                    <td
                      colSpan={4}
                      className="pt-2 pb-1 text-[#94a3b8] text-xs uppercase tracking-wider font-[family-name:var(--font-ibm-plex-mono)]"
                    >
                      {row.label}
                    </td>
                  </tr>
                );
              const isEbitda = row.key === "ebitda";
              const isTotal = row.type === "total";
              return (
                <tr
                  key={row.key}
                  className={`${isTotal ? "border-t border-[#e5e7eb] font-semibold" : ""} ${isEbitda ? "border-t-2 border-[#059669]/30" : ""}`}
                >
                  <td
                    className={`py-1.5 ${isTotal ? "text-[#1e293b]" : "text-[#64748b] pl-4"}`}
                  >
                    {row.label}
                  </td>
                  {(["y1", "y2", "y3"] as const).map((yr) => (
                    <td
                      key={yr}
                      className={`py-1.5 text-right font-[family-name:var(--font-ibm-plex-mono)] ${
                        isEbitda
                          ? pctColor(row[yr])
                          : row[yr] < 0
                            ? "text-[#dc2626]"
                            : "text-[#1e293b]"
                      }`}
                    >
                      {row[yr] < 0 ? "(" : ""}
                      {fmt(Math.abs(row[yr]))}
                      {row[yr] < 0 ? ")" : ""}
                    </td>
                  ))}
                </tr>
              );
            })}
            {/* Margin rows */}
            <tr className="border-t border-[#e5e7eb]/50">
              <td className="py-1.5 text-[#94a3b8] text-xs">
                Gross Margin
              </td>
              {(["y1", "y2", "y3"] as const).map((yr) => (
                <td
                  key={yr}
                  className="py-1.5 text-right font-[family-name:var(--font-ibm-plex-mono)] text-[#94a3b8] text-xs"
                >
                  {grossMargin(pl, yr).toFixed(0)}%
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-1.5 text-[#94a3b8] text-xs">
                EBITDA Margin
              </td>
              {(["y1", "y2", "y3"] as const).map((yr) => (
                <td
                  key={yr}
                  className={`py-1.5 text-right font-[family-name:var(--font-ibm-plex-mono)] text-xs ${pctColor(ebitdaMargin(pl, yr))}`}
                >
                  {ebitdaMargin(pl, yr).toFixed(0)}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Card>
    </Slide>,

    // ── 8: Go-to-Market ──
    <Slide key="gtm">
      <SlideHeader
        tag="Go-to-Market"
        title="Three-Phase Expansion"
        subtitle="Malaysia first, then ASEAN, then global."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GTM_PHASES.map((p) => (
          <Card key={p.phase} className="p-6 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ backgroundColor: p.color }}
            />
            <div className="flex items-baseline gap-2 mb-1">
              <span
                className="text-sm font-bold font-[family-name:var(--font-ibm-plex-mono)]"
                style={{ color: p.color }}
              >
                {p.phase}
              </span>
              <span className="text-xs text-[#94a3b8] font-[family-name:var(--font-ibm-plex-mono)]">
                {p.timeline}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-[#1e293b] mb-3 font-[family-name:var(--font-space-grotesk)]">
              {p.market}
            </h3>
            <ul className="space-y-2">
              {p.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-[#64748b]"
                >
                  <ArrowRight
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{ color: p.color }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Slide>,

    // ── 9: Traction & Milestones ──
    <Slide key="traction">
      <SlideHeader
        tag="Traction"
        title="12-Month Targets"
        subtitle="Proving product-market fit and setting up Series Seed."
      />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h3 className="text-sm text-[#94a3b8] uppercase tracking-wider mb-4 font-[family-name:var(--font-ibm-plex-mono)]">
            Key Milestones
          </h3>
          <div className="space-y-3">
            {MILESTONES_12MO.map((m) => (
              <Card
                key={m.metric}
                className="p-4 flex items-center justify-between"
              >
                <span className="text-[#64748b] text-sm">
                  {m.metric}
                </span>
                <span className="text-[#059669] font-bold font-[family-name:var(--font-ibm-plex-mono)]">
                  {m.target}
                </span>
              </Card>
            ))}
          </div>
        </div>
        <div className="md:w-72">
          <h3 className="text-sm text-[#94a3b8] uppercase tracking-wider mb-4 font-[family-name:var(--font-ibm-plex-mono)]">
            Current Status
          </h3>
          <Card className="p-5 space-y-4" accent>
            {CURRENT_STATUS.map((s) => (
              <div key={s.label}>
                <div className="text-[#94a3b8] text-xs mb-0.5">
                  {s.label}
                </div>
                <div className="text-[#1e293b] font-medium text-sm">
                  {s.value}
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </Slide>,

    // ── 10: App Demo 1 — "The Experience" ──
    <Slide key="app-demo-1">
      <SlideHeader
        tag="Live on TestFlight"
        title="The Experience"
        subtitle="AI-powered itinerary generation and real-time booking — live in the app today."
      />
      <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
        <PhoneMockup
          label="AI Itinerary Generation"
          description="User inputs trip details → AI outputs a complete day-by-day itinerary with activities, timings & costs"
        />
        <PhoneMockup
          label="Booking & Pricing"
          description="Real-time search results with flights, hotels & pricing from 25+ travel APIs"
        />
        <PhoneMockup
          label="Trip Overview"
          description="Complete trip summary with map, daily schedule & total cost breakdown"
        />
      </div>
      <p className="text-center text-[#94a3b8] text-xs mt-8 font-[family-name:var(--font-ibm-plex-mono)]">
        Replace placeholders with TestFlight screenshots &mdash; iOS app available now
      </p>
    </Slide>,

    // ── 11: App Demo 2 — "Smart Travel Tools" ──
    <Slide key="app-demo-2">
      <SlideHeader
        tag="Live on TestFlight"
        title="Smart Travel Tools"
        subtitle="Budget planning, flexible payments, and a dashboard that keeps everything organized."
      />
      <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
        <PhoneMockup
          label="Budget Planner / BNPL"
          description="3-tier budget options (Budget / Comfort / Luxury) with flexible payment features"
        />
        <PhoneMockup
          label="App Home / Dashboard"
          description="Overall look & feel — upcoming trips, recommendations & quick actions"
        />
      </div>
      <p className="text-center text-[#94a3b8] text-xs mt-8 font-[family-name:var(--font-ibm-plex-mono)]">
        Replace placeholders with TestFlight screenshots &mdash; iOS app available now
      </p>
    </Slide>,

    // ── 12: Team ──
    <Slide key="team">
      <SlideHeader
        tag="Team"
        title="Built to Scale"
        subtitle="Lean team now, structured for rapid growth."
      />
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 sm:p-8 mb-6" accent>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#059669] to-[#d97706] flex items-center justify-center text-white font-bold text-xl font-[family-name:var(--font-bebas-neue)]">
              H
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)]">
                Founder / CEO
              </h3>
              <p className="text-[#64748b] text-sm">
                Full-stack builder. Designed and built the entire platform
                (web, mobile, backend, AI engine).
              </p>
            </div>
          </div>
        </Card>
        <div className="space-y-3">
          {TEAM_SCALING.map((t) => (
            <Card
              key={t.year}
              className="p-4 flex items-center gap-4"
            >
              <div className="w-16 text-center">
                <div className="text-2xl font-bold font-[family-name:var(--font-ibm-plex-mono)] bg-gradient-to-r from-[#059669] to-[#d97706] bg-clip-text text-transparent">
                  {t.count}
                </div>
                <div className="text-[#94a3b8] text-xs">{t.year}</div>
              </div>
              <div className="text-[#64748b] text-sm flex-1">
                {t.roles}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Slide>,

    // ── 13: Investment Ask (Interactive) ──
    <Slide key="invest">
      <SlideHeader
        tag="Investment"
        title="The Ask"
        subtitle="Seed round — configure your investment below."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Sliders + calculated outputs */}
        <div className="space-y-5">
          {/* Investment slider */}
          <Card className="p-5">
            <label className="text-xs text-[#94a3b8] font-[family-name:var(--font-ibm-plex-mono)] uppercase tracking-wider">
              Investment Amount
            </label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min={200_000}
                max={1_000_000}
                step={50_000}
                value={investAmount}
                onChange={(e) => setInvestAmount(parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: "#059669" }}
              />
              <span className="text-lg font-bold font-[family-name:var(--font-ibm-plex-mono)] text-[#059669] w-28 text-right">
                {fmtRM(investAmount)}
              </span>
            </div>
          </Card>
          {/* Valuation slider */}
          <Card className="p-5">
            <label className="text-xs text-[#94a3b8] font-[family-name:var(--font-ibm-plex-mono)] uppercase tracking-wider">
              Pre-Money Valuation
            </label>
            <div className="flex items-center gap-3 mt-2">
              <input
                type="range"
                min={5_000_000}
                max={10_000_000}
                step={500_000}
                value={valuation}
                onChange={(e) => setValuation(parseInt(e.target.value))}
                className="flex-1"
                style={{ accentColor: "#d97706" }}
              />
              <span className="text-lg font-bold font-[family-name:var(--font-ibm-plex-mono)] text-[#d97706] w-28 text-right">
                {fmtRM(valuation)}
              </span>
            </div>
          </Card>
          {/* Calculated outputs */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-3 text-center">
              <div className="text-xs text-[#94a3b8] mb-1">Post-money</div>
              <div className="text-sm font-bold font-[family-name:var(--font-ibm-plex-mono)] text-[#1e293b]">
                {fmtRM(investCalc.postMoney)}
              </div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-xs text-[#94a3b8] mb-1">Equity</div>
              <div className="text-sm font-bold font-[family-name:var(--font-ibm-plex-mono)] text-[#059669]">
                {investCalc.equityPct.toFixed(2)}%
              </div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-xs text-[#94a3b8] mb-1">
                Founders
              </div>
              <div className="text-sm font-bold font-[family-name:var(--font-ibm-plex-mono)] text-[#1e293b]">
                {investCalc.foundersRetainPct.toFixed(2)}%
              </div>
            </Card>
          </div>
          {/* Custom input */}
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => {
                  setCustomMode("pct");
                  setCustomInput("");
                }}
                className={`text-xs px-3 py-1 rounded font-[family-name:var(--font-ibm-plex-mono)] transition-colors ${
                  customMode === "pct"
                    ? "bg-[#059669]/10 text-[#059669] border border-[#059669]/40"
                    : "text-[#94a3b8] border border-[#e5e7eb]"
                }`}
              >
                I want X%
              </button>
              <button
                onClick={() => {
                  setCustomMode("rm");
                  setCustomInput("");
                }}
                className={`text-xs px-3 py-1 rounded font-[family-name:var(--font-ibm-plex-mono)] transition-colors ${
                  customMode === "rm"
                    ? "bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/40"
                    : "text-[#94a3b8] border border-[#e5e7eb]"
                }`}
              >
                I have RM X
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#94a3b8] text-sm">
                {customMode === "pct" ? "%" : "RM"}
              </span>
              <input
                type="number"
                value={customInput}
                onChange={(e) => handleCustomInput(e.target.value)}
                placeholder={
                  customMode === "pct" ? "e.g. 8" : "e.g. 600000"
                }
                className="flex-1 bg-[#f8fafb] border border-[#e5e7eb] rounded px-3 py-2 text-sm text-[#1e293b] font-[family-name:var(--font-ibm-plex-mono)] focus:outline-none focus:border-[#059669]/50"
              />
              {customInput && !isNaN(parseFloat(customInput)) && (
                <span className="text-xs text-[#64748b]">
                  {customMode === "pct"
                    ? `= ${fmtRM(
                        (parseFloat(customInput) / 100) *
                          valuation /
                          (1 - parseFloat(customInput) / 100),
                      )}`
                    : `= ${((parseFloat(customInput) / (valuation + parseFloat(customInput))) * 100).toFixed(2)}%`}
                </span>
              )}
            </div>
          </Card>
        </div>
        {/* Right: Exit returns + Use of funds */}
        <div className="space-y-5">
          {/* Exit returns */}
          <Card className="p-5" accent>
            <h3 className="text-sm text-[#94a3b8] uppercase tracking-wider mb-3 font-[family-name:var(--font-ibm-plex-mono)]">
              Y3 Exit Scenarios
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th className="text-left py-1.5 text-[#94a3b8] font-normal text-xs">
                    Revenue Multiple
                  </th>
                  <th className="text-right py-1.5 text-[#94a3b8] font-normal text-xs">
                    Valuation
                  </th>
                  <th className="text-right py-1.5 text-[#94a3b8] font-normal text-xs">
                    Your Return
                  </th>
                  <th className="text-right py-1.5 text-[#94a3b8] font-normal text-xs">
                    Multiple
                  </th>
                </tr>
              </thead>
              <tbody>
                {exitReturns.map((e) => (
                  <tr key={e.multiple} className="border-b border-[#e5e7eb]/50">
                    <td className="py-2 text-[#64748b] font-[family-name:var(--font-ibm-plex-mono)]">
                      {e.multiple}x
                    </td>
                    <td className="py-2 text-right text-[#1e293b] font-[family-name:var(--font-ibm-plex-mono)]">
                      {fmtRM(e.y3Valuation)}
                    </td>
                    <td className="py-2 text-right text-[#059669] font-bold font-[family-name:var(--font-ibm-plex-mono)]">
                      {fmtRM(e.investorShare)}
                    </td>
                    <td className="py-2 text-right text-[#d97706] font-bold font-[family-name:var(--font-ibm-plex-mono)]">
                      {e.returnMultiple.toFixed(1)}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[#94a3b8] text-xs mt-3">
              Based on Y3 base revenue of RM {Y3_BASE_REVENUE}M and marketplace 5-7x
              multiples
            </p>
          </Card>
          {/* Use of funds pie */}
          <Card className="p-5">
            <h3 className="text-sm text-[#94a3b8] uppercase tracking-wider mb-4 font-[family-name:var(--font-ibm-plex-mono)]">
              Use of Funds
            </h3>
            <div className="flex items-center gap-6">
              <div
                className="w-28 h-28 rounded-full flex-shrink-0"
                style={{ background: pieGradient }}
              />
              <div className="space-y-2 flex-1">
                {FUND_ALLOCATIONS.map((a) => (
                  <div
                    key={a.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: a.color }}
                      />
                      <span className="text-[#64748b]">{a.label}</span>
                    </div>
                    <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[#1e293b]">
                      {fmtRM(investAmount * (a.pct / 100))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Slide>,

    // ── 14: Terms ──
    <Slide key="terms">
      <SlideHeader
        tag="Terms"
        title="Term Sheet Summary"
        subtitle="Clean, founder-friendly structure designed for alignment."
      />
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 sm:p-8" accent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {TERMS.map((t) => (
              <div key={t.term} className="py-2 border-b border-[#e5e7eb]/50">
                <div className="text-[#94a3b8] text-xs font-[family-name:var(--font-ibm-plex-mono)] uppercase tracking-wider mb-1">
                  {t.term}
                </div>
                <div className="text-[#1e293b] text-sm font-medium">
                  {t.detail}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-[#94a3b8]">
          <span>No participating preferred</span>
          <span className="text-[#e5e7eb]">|</span>
          <span>No multiple liquidation</span>
          <span className="text-[#e5e7eb]">|</span>
          <span>No full board control</span>
        </div>
      </div>
    </Slide>,

    // ── 15: CTA / Close ──
    <Slide key="cta">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-bold bg-gradient-to-r from-[#059669] via-[#d97706] to-[#0891b7] bg-clip-text text-transparent font-[family-name:var(--font-bebas-neue)] leading-tight mb-6">
          Let&apos;s Build the Future of Travel
        </h2>
        <p className="text-[#64748b] text-[clamp(0.875rem,1.5vw,1.125rem)] mb-10 leading-relaxed">
          Holiday AI is ready to prove traction with RM 500K in seed capital.
          We have the product, the market, and the plan. We need a partner
          who shares the vision.
        </p>
        <Card className="p-6 sm:p-8 inline-block" accent>
          <h3 className="text-sm text-[#94a3b8] uppercase tracking-wider mb-4 font-[family-name:var(--font-ibm-plex-mono)]">
            Next Steps
          </h3>
          <div className="space-y-3 text-left">
            {[
              "Schedule a 30-minute product demo",
              "Review detailed financial model",
              "Discuss term sheet and timeline",
              "Begin due diligence",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <span className="w-6 h-6 rounded-full bg-[#059669]/10 text-[#059669] text-xs font-bold flex items-center justify-center font-[family-name:var(--font-ibm-plex-mono)]">
                  {i + 1}
                </span>
                <span className="text-[#64748b]">{step}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-[#94a3b8]">
          <span className="flex items-center gap-1.5">
            <Mail className="w-4 h-4" /> hello@holidayai.app
          </span>
          <span className="flex items-center gap-1.5">
            <Globe className="w-4 h-4" /> holidayai.app
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Kuala Lumpur, Malaysia
          </span>
        </div>
      </div>
    </Slide>,
  ];

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-[#f8fafb] font-[family-name:var(--font-inter)]"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide track */}
      <div
        ref={containerRef}
        className="relative z-[1] h-full flex transition-transform duration-[400ms] ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides}
      </div>

      {/* Nav arrows */}
      {current > 0 && (
        <button
          onClick={prev}
          className="fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-[#e5e7eb] shadow-md flex items-center justify-center text-[#94a3b8] hover:text-[#1e293b] hover:border-[#d1d5db] transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      {current < TOTAL_SLIDES - 1 && (
        <button
          onClick={next}
          className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white border border-[#e5e7eb] shadow-md flex items-center justify-center text-[#94a3b8] hover:text-[#1e293b] hover:border-[#d1d5db] transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Dot indicators */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
        {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-[#059669] w-6"
                : "bg-[#94a3b8]/30 hover:bg-[#94a3b8]"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="fixed bottom-5 right-5 z-10 text-xs text-[#94a3b8] font-[family-name:var(--font-ibm-plex-mono)]">
        {current + 1} / {TOTAL_SLIDES}
      </div>
    </div>
  );
}
