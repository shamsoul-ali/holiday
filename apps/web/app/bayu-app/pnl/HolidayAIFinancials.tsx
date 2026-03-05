"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  Scale,
  Target,
  Calculator,
  Settings2,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import {
  type Assumptions,
  type Scenario,
  type FinancialRow,
  type CashFlowRow,
  type BalanceSheetRow,
  DEFAULT_ASSUMPTIONS,
  SCENARIO_PRESETS,
  COGS_SEGMENTS,
  CAC_CHANNELS,
  PL_REVENUE_BASE,
  computePL,
  computeCashFlow,
  computeBalanceSheet,
  computeUnitEconomics,
  computeROI,
  formatRM,
  formatPct,
  formatNumber,
} from "@/lib/budget-data/holidayai-financials";
import { FUND_ALLOCATIONS } from "@/lib/budget-data/holidayai";

// ── Tab Config ──

const TABS = [
  { key: "pl", label: "P&L", icon: BarChart3 },
  { key: "cashflow", label: "Cash Flow", icon: TrendingUp },
  { key: "balance", label: "Balance Sheet", icon: Scale },
  { key: "unit", label: "Unit Economics", icon: Target },
  { key: "roi", label: "ROI Calculator", icon: Calculator },
  { key: "assumptions", label: "Assumptions", icon: Settings2 },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ── Shared Sub-Components ──

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

function MetricCard({
  label,
  value,
  delta,
  prefix,
  small,
}: {
  label: string;
  value: string;
  delta?: number;
  prefix?: string;
  small?: boolean;
}) {
  return (
    <Card className={small ? "p-3" : "p-4 sm:p-5"}>
      <p className="text-[#94a3b8] text-xs font-[family-name:var(--font-ibm-plex-mono)] uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`${small ? "text-lg" : "text-xl sm:text-2xl"} font-semibold text-[#1e293b] mt-1 font-[family-name:var(--font-space-grotesk)]`}
      >
        {prefix}
        {value}
      </p>
      {delta !== undefined && (
        <div
          className={`flex items-center gap-1 mt-1 text-xs font-medium ${delta >= 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
        >
          {delta >= 0 ? (
            <ArrowUpRight size={12} />
          ) : (
            <ArrowDownRight size={12} />
          )}
          {delta >= 0 ? "+" : ""}
          {delta.toFixed(1)}%
        </div>
      )}
    </Card>
  );
}

function FinancialTable({
  rows,
  title,
  unit = "RM millions",
}: {
  rows: (FinancialRow | CashFlowRow | BalanceSheetRow)[];
  title?: string;
  unit?: string;
}) {
  return (
    <Card className="p-4 sm:p-6 overflow-x-auto" accent>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)]">
            {title}
          </h3>
          <span className="text-[10px] text-[#94a3b8] font-[family-name:var(--font-ibm-plex-mono)] uppercase">
            {unit}
          </span>
        </div>
      )}
      <table className="w-full text-sm min-w-[500px]">
        <thead>
          <tr className="border-b border-[#e5e7eb]">
            <th className="text-left py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs w-[45%]">
              Line Item
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
          {rows.map((row) => {
            if (row.type === "spacer")
              return <tr key={row.key} className="h-3" />;
            if (row.type === "header")
              return (
                <tr key={row.key}>
                  <td
                    colSpan={4}
                    className="pt-3 pb-1 text-[#94a3b8] font-[family-name:var(--font-ibm-plex-mono)] text-[10px] uppercase tracking-widest"
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
                className={`${isTotal ? "border-t border-[#e5e7eb] font-semibold" : "border-b border-[#e5e7eb]/30"} ${isEbitda ? "border-t-2 border-[#059669]/30" : ""}`}
              >
                <td
                  className={`py-2 ${isTotal ? "text-[#1e293b]" : "text-[#64748b]"}`}
                >
                  {row.label}
                </td>
                {(["y1", "y2", "y3"] as const).map((y) => {
                  const val = row[y];
                  const color =
                    isTotal && val > 0
                      ? "text-[#059669]"
                      : val < 0
                        ? "text-[#dc2626]"
                        : "text-[#1e293b]";
                  return (
                    <td
                      key={y}
                      className={`py-2 text-right font-[family-name:var(--font-ibm-plex-mono)] text-xs ${color}`}
                    >
                      {formatRM(val)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  color = "#059669",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm text-[#64748b] min-w-[120px]">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-40 sm:w-56"
        style={{ accentColor: color }}
      />
      <span className="text-sm font-semibold text-[#1e293b] font-[family-name:var(--font-ibm-plex-mono)] min-w-[60px]">
        {format(value)}
      </span>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  prefix = "",
  suffix = "",
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#64748b] min-w-[100px]">{label}</span>
      <div className="flex items-center bg-[#f8fafb] border border-[#e5e7eb] rounded px-2 py-1">
        {prefix && (
          <span className="text-xs text-[#94a3b8] mr-1">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-20 bg-transparent text-right text-xs font-[family-name:var(--font-ibm-plex-mono)] text-[#1e293b] outline-none"
        />
        {suffix && (
          <span className="text-xs text-[#94a3b8] ml-1">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 bg-[#f1f5f9] rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            value === opt.value
              ? "bg-white text-[#059669] shadow-sm"
              : "text-[#64748b] hover:text-[#1e293b]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Main Component ──

export default function HolidayAIFinancials() {
  const [activeTab, setActiveTab] = useState<TabKey>("pl");
  const [assumptions, setAssumptions] = useState<Assumptions>({
    ...DEFAULT_ASSUMPTIONS,
  });
  const [investAmount, setInvestAmount] = useState(500000);
  const [investValuation, setInvestValuation] = useState(7000000);

  // ── Memo Cascade ──
  const pl = useMemo(() => computePL(assumptions), [assumptions]);
  const cf = useMemo(
    () => computeCashFlow(pl, assumptions),
    [pl, assumptions],
  );
  const bs = useMemo(
    () => computeBalanceSheet(cf, pl, assumptions),
    [cf, pl, assumptions],
  );
  const unitEcon = useMemo(
    () => computeUnitEconomics(assumptions),
    [assumptions],
  );
  const roi = useMemo(
    () => computeROI(investAmount, investValuation, pl, assumptions),
    [investAmount, investValuation, pl, assumptions],
  );

  // Helper to get P&L values
  const plv = useCallback(
    (key: string, year: "y1" | "y2" | "y3") =>
      pl.find((r) => r.key === key)?.[year] ?? 0,
    [pl],
  );

  // Scenario loader
  const loadScenario = useCallback(
    (s: Scenario) => {
      const preset = SCENARIO_PRESETS[s];
      setAssumptions({ ...DEFAULT_ASSUMPTIONS, ...preset });
    },
    [],
  );

  const updateAssumption = useCallback(
    <K extends keyof Assumptions>(key: K, value: Assumptions[K]) => {
      setAssumptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // ── Derived metrics ──
  const totalRevY3 = plv("total_rev", "y3");
  const grossMarginY3 =
    totalRevY3 !== 0 ? (plv("gross", "y3") / totalRevY3) * 100 : 0;
  const ebitdaMarginY3 =
    totalRevY3 !== 0 ? (plv("ebitda", "y3") / totalRevY3) * 100 : 0;
  const totalRevY1 = plv("total_rev", "y1");
  const revenueCAGR =
    totalRevY1 > 0
      ? (Math.pow(totalRevY3 / totalRevY1, 1 / 2) - 1) * 100
      : 0;

  const endCashY3 = cf.find((r) => r.key === "end_cash")?.y3 ?? 0;
  const opCFY3 = cf.find((r) => r.key === "op_cf")?.y3 ?? 0;
  const freeCFY3 =
    opCFY3 + (cf.find((r) => r.key === "inv_cf")?.y3 ?? 0);
  const monthlyBurnY1 = Math.abs(plv("ebitda", "y1")) / 12;

  const totalAssetsY3 = bs.find((r) => r.key === "total_assets")?.y3 ?? 0;
  const totalLEY3 = bs.find((r) => r.key === "total_le")?.y3 ?? 0;
  const isBalanced = Math.abs(totalAssetsY3 - totalLEY3) < 0.01;

  // COGS breakdown percentages
  const totalCogsPct =
    assumptions.cogsAI +
    assumptions.cogsPayment +
    assumptions.cogsCloud +
    assumptions.cogsSupport;

  return (
    <div className="min-h-dvh bg-[#f8fafb]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] px-4 sm:px-6 py-4">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#059669] to-[#d97706] flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[#1e293b] font-[family-name:var(--font-space-grotesk)]">
                Holiday AI — Financial Analysis
              </h1>
              <p className="text-xs text-[#94a3b8]">
                Interactive workbook • All figures in RM millions unless stated
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-[#e5e7eb] shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-[#059669] text-[#059669]"
                      : "border-transparent text-[#64748b] hover:text-[#1e293b]"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* ── Tab 1: P&L Statement ── */}
        {activeTab === "pl" && (
          <>
            {/* Controls */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                <SliderInput
                  label="Growth Multiplier"
                  value={assumptions.growthMultiplier}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  onChange={(v) => updateAssumption("growthMultiplier", v)}
                  format={(v) => `${v.toFixed(1)}x`}
                />
                <ToggleGroup
                  options={[
                    { label: "Conservative", value: "conservative" },
                    { label: "Base", value: "base" },
                    { label: "Aggressive", value: "aggressive" },
                  ]}
                  value={assumptions.scenario}
                  onChange={(v) => loadScenario(v as Scenario)}
                />
              </div>
            </Card>

            {/* KPI Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <MetricCard
                label="Total Revenue Y3"
                value={`RM ${totalRevY3.toFixed(1)}M`}
              />
              <MetricCard
                label="Gross Margin"
                value={`${grossMarginY3.toFixed(0)}%`}
              />
              <MetricCard
                label="EBITDA Margin Y3"
                value={`${ebitdaMarginY3.toFixed(0)}%`}
              />
              <MetricCard
                label="Revenue CAGR"
                value={`${revenueCAGR.toFixed(0)}%`}
              />
            </div>

            {/* P&L Table */}
            <FinancialTable rows={pl} title="Income Statement" />

            {/* COGS Breakdown + Revenue Mix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* COGS Breakdown Bar */}
              <Card className="p-4 sm:p-6" accent>
                <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)] mb-4">
                  COGS Breakdown
                </h3>
                <div className="h-8 rounded-full overflow-hidden flex">
                  {COGS_SEGMENTS.map((seg) => {
                    const val =
                      seg.key === "ai"
                        ? assumptions.cogsAI
                        : seg.key === "payment"
                          ? assumptions.cogsPayment
                          : seg.key === "cloud"
                            ? assumptions.cogsCloud
                            : assumptions.cogsSupport;
                    const pct = totalCogsPct > 0 ? (val / totalCogsPct) * 100 : 25;
                    return (
                      <div
                        key={seg.key}
                        className="h-full flex items-center justify-center text-white text-[10px] font-medium"
                        style={{ width: `${pct}%`, backgroundColor: seg.color }}
                        title={`${seg.label}: ${val}%`}
                      >
                        {pct > 15 ? `${val}%` : ""}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {COGS_SEGMENTS.map((seg) => {
                    const val =
                      seg.key === "ai"
                        ? assumptions.cogsAI
                        : seg.key === "payment"
                          ? assumptions.cogsPayment
                          : seg.key === "cloud"
                            ? assumptions.cogsCloud
                            : assumptions.cogsSupport;
                    return (
                      <div key={seg.key} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-xs text-[#64748b]">
                          {seg.label} ({val}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-[#94a3b8] mt-2 font-[family-name:var(--font-ibm-plex-mono)]">
                  Total COGS: {totalCogsPct.toFixed(1)}% of revenue
                </p>
              </Card>

              {/* Revenue Mix */}
              <Card className="p-4 sm:p-6" accent>
                <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)] mb-4">
                  Revenue Mix
                </h3>
                {(["y1", "y2", "y3"] as const).map((y, yi) => {
                  const streams = [
                    {
                      label: "Commission",
                      val: plv("commission", y),
                      color: "#059669",
                    },
                    {
                      label: "SaaS",
                      val: plv("saas", y),
                      color: "#0891b2",
                    },
                    {
                      label: "Fintech",
                      val: plv("fintech", y),
                      color: "#d97706",
                    },
                    {
                      label: "Ads",
                      val: plv("ads", y),
                      color: "#7c3aed",
                    },
                    {
                      label: "Premium",
                      val: plv("premium", y),
                      color: "#94a3b8",
                    },
                  ];
                  const total = streams.reduce((s, r) => s + r.val, 0);
                  return (
                    <div key={y} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#64748b]">Year {yi + 1}</span>
                        <span className="text-[#1e293b] font-[family-name:var(--font-ibm-plex-mono)]">
                          RM {total.toFixed(1)}M
                        </span>
                      </div>
                      <div className="h-6 rounded-full overflow-hidden flex">
                        {streams.map((s) => {
                          const pct =
                            total > 0 ? (s.val / total) * 100 : 20;
                          return (
                            <div
                              key={s.label}
                              className="h-full"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: s.color,
                              }}
                              title={`${s.label}: RM ${s.val.toFixed(1)}M (${pct.toFixed(0)}%)`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                <div className="flex flex-wrap gap-3 mt-2">
                  {[
                    { label: "Commission", color: "#059669" },
                    { label: "SaaS", color: "#0891b2" },
                    { label: "Fintech", color: "#d97706" },
                    { label: "Ads", color: "#7c3aed" },
                    { label: "Premium", color: "#94a3b8" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      <span className="text-xs text-[#64748b]">{s.label}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}

        {/* ── Tab 2: Cash Flow ── */}
        {activeTab === "cashflow" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <MetricCard
                label="Operating CF Y3"
                value={`RM ${opCFY3.toFixed(1)}M`}
              />
              <MetricCard
                label="Free Cash Flow Y3"
                value={`RM ${freeCFY3.toFixed(1)}M`}
              />
              <MetricCard
                label="Ending Cash Y3"
                value={`RM ${endCashY3.toFixed(1)}M`}
              />
              <MetricCard
                label="Monthly Burn Y1"
                value={`RM ${(monthlyBurnY1 * 1000).toFixed(0)}K`}
              />
            </div>

            <FinancialTable rows={cf} title="Cash Flow Statement" />

            {/* Cash Runway */}
            <Card className="p-4 sm:p-6" accent>
              <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)] mb-3">
                Cash Position by Year
              </h3>
              <div className="space-y-3">
                {(["y1", "y2", "y3"] as const).map((y, i) => {
                  const cash = cf.find((r) => r.key === "end_cash")?.[y] ?? 0;
                  const maxCash = Math.max(
                    Math.abs(cf.find((r) => r.key === "end_cash")?.y1 ?? 0),
                    Math.abs(cf.find((r) => r.key === "end_cash")?.y2 ?? 0),
                    Math.abs(cf.find((r) => r.key === "end_cash")?.y3 ?? 0),
                    1,
                  );
                  const pct = Math.max(
                    (Math.abs(cash) / maxCash) * 100,
                    3,
                  );
                  return (
                    <div key={y}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#64748b]">Year {i + 1}</span>
                        <span
                          className={`font-[family-name:var(--font-ibm-plex-mono)] ${cash >= 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
                        >
                          RM {cash.toFixed(1)}M
                        </span>
                      </div>
                      <div className="h-4 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor:
                              cash >= 0 ? "#059669" : "#dc2626",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {/* ── Tab 3: Balance Sheet ── */}
        {activeTab === "balance" && (
          <>
            {/* Balance Check */}
            <Card className="p-4 sm:p-5">
              <div className="flex items-center gap-3">
                {isBalanced ? (
                  <CheckCircle2 className="text-[#059669]" size={24} />
                ) : (
                  <XCircle className="text-[#dc2626]" size={24} />
                )}
                <div>
                  <p
                    className={`font-semibold ${isBalanced ? "text-[#059669]" : "text-[#dc2626]"}`}
                  >
                    {isBalanced
                      ? "Balanced"
                      : `Imbalanced (delta: RM ${Math.abs(totalAssetsY3 - totalLEY3).toFixed(2)}M)`}
                  </p>
                  <p className="text-xs text-[#94a3b8]">
                    Total Assets = Total Liabilities + Equity
                  </p>
                </div>
              </div>
            </Card>

            <FinancialTable rows={bs} title="Balance Sheet" />
          </>
        )}

        {/* ── Tab 4: Unit Economics ── */}
        {activeTab === "unit" && (
          <>
            {/* Per-trip Waterfall */}
            <Card className="p-4 sm:p-6" accent>
              <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)] mb-4">
                Per-Trip Waterfall (B2C)
              </h3>
              <table className="w-full text-sm">
                <tbody>
                  {unitEcon.waterfall.map((item, i) => (
                    <tr
                      key={i}
                      className={`${item.isSubtotal ? "border-t border-[#e5e7eb] font-semibold" : "border-b border-[#e5e7eb]/30"}`}
                    >
                      <td
                        className={`py-2 ${item.isSubtotal ? "text-[#1e293b]" : "text-[#64748b]"}`}
                      >
                        {item.label}
                      </td>
                      <td
                        className={`py-2 text-right font-[family-name:var(--font-ibm-plex-mono)] ${
                          item.isNegative
                            ? "text-[#dc2626]"
                            : item.isSubtotal
                              ? "text-[#059669]"
                              : "text-[#1e293b]"
                        }`}
                      >
                        {item.isNegative
                          ? `(RM ${Math.abs(item.value).toFixed(0)})`
                          : `RM ${item.value.toFixed(0)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* B2C vs B2B Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card className="p-4 sm:p-6" accent>
                <h3 className="text-base font-semibold text-[#1e293b] mb-3">
                  B2C Key Ratios
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {unitEcon.b2cMetrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-[10px] text-[#94a3b8] font-[family-name:var(--font-ibm-plex-mono)] uppercase">
                        {m.label}
                      </p>
                      <p className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)]">
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-4 sm:p-6" accent>
                <h3 className="text-base font-semibold text-[#1e293b] mb-3">
                  B2B Key Ratios
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {unitEcon.b2bMetrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-[10px] text-[#94a3b8] font-[family-name:var(--font-ibm-plex-mono)] uppercase">
                        {m.label}
                      </p>
                      <p className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)]">
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* CAC/LTV by Channel */}
            <Card className="p-4 sm:p-6 overflow-x-auto" accent>
              <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)] mb-4">
                CAC / LTV by Channel
              </h3>
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="text-left py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Channel
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      CAC
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      LTV
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      LTV:CAC
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CAC_CHANNELS.map((ch) => (
                    <tr
                      key={ch.channel}
                      className="border-b border-[#e5e7eb]/50"
                    >
                      <td className="py-2 text-[#1e293b]">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: ch.color }}
                          />
                          {ch.channel}
                        </div>
                      </td>
                      <td className="py-2 text-right font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#1e293b]">
                        RM {ch.cac}
                      </td>
                      <td className="py-2 text-right font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#1e293b]">
                        RM {ch.ltv.toLocaleString()}
                      </td>
                      <td className="py-2 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            ch.ratio >= 15
                              ? "bg-[#059669]/10 text-[#059669]"
                              : ch.ratio >= 10
                                ? "bg-[#d97706]/10 text-[#d97706]"
                                : "bg-[#dc2626]/10 text-[#dc2626]"
                          }`}
                        >
                          {ch.ratio.toFixed(1)}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Sensitivity Analysis */}
            <Card className="p-4 sm:p-6" accent>
              <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)] mb-4">
                Sensitivity Analysis
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {unitEcon.sensitivity.map((s) => (
                  <div
                    key={s.scenario}
                    className={`p-3 rounded-lg border ${s.scenario === "base" ? "border-[#059669]/30 bg-[#059669]/5" : "border-[#e5e7eb] bg-[#f8fafb]"}`}
                  >
                    <p className="text-xs text-[#64748b] mb-1">{s.label}</p>
                    <p className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-ibm-plex-mono)]">
                      RM {s.cm.toFixed(0)}
                    </p>
                    {s.delta !== 0 && (
                      <p
                        className={`text-xs mt-1 ${s.delta >= 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
                      >
                        {s.delta >= 0 ? "+" : ""}RM {s.delta.toFixed(0)}{" "}
                        per trip
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* ── Tab 5: ROI Calculator ── */}
        {activeTab === "roi" && (
          <>
            {/* Investment Sliders */}
            <Card className="p-4 sm:p-6">
              <div className="space-y-4">
                <SliderInput
                  label="Investment"
                  value={investAmount}
                  min={100000}
                  max={2000000}
                  step={50000}
                  onChange={setInvestAmount}
                  format={(v) => `RM ${(v / 1000).toFixed(0)}K`}
                  color="#059669"
                />
                <SliderInput
                  label="Pre-Money Valuation"
                  value={investValuation}
                  min={3000000}
                  max={15000000}
                  step={500000}
                  onChange={setInvestValuation}
                  format={(v) => `RM ${(v / 1000000).toFixed(1)}M`}
                  color="#d97706"
                />
              </div>
            </Card>

            {/* Equity Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <MetricCard
                label="Post-Money Valuation"
                value={`RM ${(roi.equity.postMoney / 1000000).toFixed(1)}M`}
              />
              <MetricCard
                label="Investor Equity"
                value={`${roi.equity.equityPct.toFixed(2)}%`}
              />
              <MetricCard
                label="Founders Retain"
                value={`${roi.equity.foundersRetain.toFixed(2)}%`}
              />
            </div>

            {/* Scenario Comparison */}
            <Card className="p-4 sm:p-6 overflow-x-auto" accent>
              <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)] mb-4">
                Y3 Scenario Comparison
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="text-left py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Scenario
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Y3 Revenue
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Y3 EBITDA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roi.scenarioComparison.map((s) => (
                    <tr
                      key={s.scenario}
                      className="border-b border-[#e5e7eb]/50"
                    >
                      <td className="py-2.5 text-[#1e293b] font-medium">
                        {s.scenario}
                      </td>
                      <td className="py-2.5 text-right font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#059669]">
                        RM {s.y3Revenue.toFixed(1)}M
                      </td>
                      <td
                        className={`py-2.5 text-right font-[family-name:var(--font-ibm-plex-mono)] text-xs ${s.y3EBITDA >= 0 ? "text-[#059669]" : "text-[#dc2626]"}`}
                      >
                        RM {s.y3EBITDA.toFixed(1)}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Exit Return Matrix */}
            <Card className="p-4 sm:p-6 overflow-x-auto" accent>
              <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)] mb-4">
                Exit Return Matrix (Investor Share)
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="text-left py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Multiple
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Conservative
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Base
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Aggressive
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roi.exitMatrix.map((row) => (
                    <tr
                      key={row.multiple}
                      className="border-b border-[#e5e7eb]/50"
                    >
                      <td className="py-2.5 text-[#1e293b] font-medium">
                        {row.multiple}x Revenue
                      </td>
                      {(
                        ["conservative", "base", "aggressive"] as const
                      ).map((s) => {
                        const val = row[s];
                        const returnX = val / investAmount;
                        return (
                          <td
                            key={s}
                            className="py-2.5 text-right font-[family-name:var(--font-ibm-plex-mono)] text-xs"
                          >
                            <span className="text-[#1e293b]">
                              RM {(val / 1000000).toFixed(1)}M
                            </span>
                            <span className="ml-1 text-[#059669]">
                              ({returnX.toFixed(0)}x)
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Dilution Modeling */}
            <Card className="p-4 sm:p-6 overflow-x-auto" accent>
              <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)] mb-4">
                Dilution Modeling
              </h3>
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="text-left py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Round
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Raise
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Pre-Money
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      New Equity
                    </th>
                    <th className="text-right py-2 text-[#94a3b8] font-normal font-[family-name:var(--font-ibm-plex-mono)] text-xs">
                      Founders
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {roi.dilution.map((d) => (
                    <tr
                      key={d.round}
                      className="border-b border-[#e5e7eb]/50"
                    >
                      <td className="py-2.5 text-[#1e293b] font-medium">
                        {d.round}
                      </td>
                      <td className="py-2.5 text-right font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#1e293b]">
                        {formatRM(d.raise, false)}
                      </td>
                      <td className="py-2.5 text-right font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#1e293b]">
                        {formatRM(d.valuation, false)}
                      </td>
                      <td className="py-2.5 text-right font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#d97706]">
                        {d.newEquity.toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right">
                        {/* Founder bar */}
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-3 bg-[#f1f5f9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#059669] rounded-full"
                              style={{ width: `${d.founderPct}%` }}
                            />
                          </div>
                          <span className="text-xs font-[family-name:var(--font-ibm-plex-mono)] text-[#059669]">
                            {d.founderPct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>

            {/* Use of Funds */}
            <Card className="p-4 sm:p-6" accent>
              <h3 className="text-lg font-semibold text-[#1e293b] font-[family-name:var(--font-space-grotesk)] mb-4">
                Use of Funds
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Pie */}
                <div
                  className="w-40 h-40 rounded-full flex-shrink-0"
                  style={{
                    background: (() => {
                      let cum = 0;
                      const stops = roi.fundAllocation.map((f) => {
                        const start = cum;
                        cum += f.pct;
                        return `${f.color} ${start}% ${cum}%`;
                      });
                      return `conic-gradient(${stops.join(", ")})`;
                    })(),
                  }}
                />
                {/* Legend */}
                <div className="flex-1 space-y-2">
                  {roi.fundAllocation.map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: f.color }}
                        />
                        <span className="text-sm text-[#1e293b]">
                          {f.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-[#1e293b] font-[family-name:var(--font-ibm-plex-mono)]">
                          {formatRM(f.amount, false)}
                        </span>
                        <span className="text-xs text-[#94a3b8] ml-2">
                          ({f.pct}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )}

        {/* ── Tab 6: Assumptions ── */}
        {activeTab === "assumptions" && (
          <>
            {/* Scenario Quick-Load */}
            <Card className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-[#1e293b]">
                  Load Scenario:
                </span>
                <ToggleGroup
                  options={[
                    { label: "Conservative", value: "conservative" },
                    { label: "Base", value: "base" },
                    { label: "Aggressive", value: "aggressive" },
                  ]}
                  value={assumptions.scenario}
                  onChange={(v) => loadScenario(v as Scenario)}
                />
                <button
                  onClick={() =>
                    setAssumptions({ ...DEFAULT_ASSUMPTIONS })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#64748b] hover:text-[#1e293b] border border-[#e5e7eb] rounded-md transition-colors"
                >
                  <RotateCcw size={12} />
                  Reset Defaults
                </button>
              </div>
            </Card>

            {/* Growth & Revenue */}
            <Card className="p-4 sm:p-6" accent>
              <h3 className="text-base font-semibold text-[#1e293b] mb-4">
                Growth & Revenue
              </h3>
              <div className="space-y-4">
                <SliderInput
                  label="Growth Multiplier"
                  value={assumptions.growthMultiplier}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  onChange={(v) => updateAssumption("growthMultiplier", v)}
                  format={(v) => `${v.toFixed(1)}x`}
                />
                <div>
                  <p className="text-xs text-[#94a3b8] mb-2 font-[family-name:var(--font-ibm-plex-mono)] uppercase">
                    Conversion Rates (%)
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {(["Y1", "Y2", "Y3"] as const).map((label, i) => (
                      <NumberInput
                        key={label}
                        label={label}
                        value={assumptions.conversionRates[i]}
                        suffix="%"
                        min={1}
                        max={30}
                        step={0.5}
                        onChange={(v) => {
                          const next = [
                            ...assumptions.conversionRates,
                          ] as [number, number, number];
                          next[i] = v;
                          updateAssumption("conversionRates", next);
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#94a3b8] mb-2 font-[family-name:var(--font-ibm-plex-mono)] uppercase">
                    Blended Take Rates (%)
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {(["Y1", "Y2", "Y3"] as const).map((label, i) => (
                      <NumberInput
                        key={label}
                        label={label}
                        value={assumptions.takeRates[i]}
                        suffix="%"
                        min={3}
                        max={20}
                        step={0.1}
                        onChange={(v) => {
                          const next = [...assumptions.takeRates] as [
                            number,
                            number,
                            number,
                          ];
                          next[i] = v;
                          updateAssumption("takeRates", next);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* COGS */}
            <Card className="p-4 sm:p-6" accent>
              <h3 className="text-base font-semibold text-[#1e293b] mb-4">
                COGS Breakdown (% of Revenue)
              </h3>
              <div className="space-y-3">
                <SliderInput
                  label="AI Compute"
                  value={assumptions.cogsAI}
                  min={1}
                  max={15}
                  step={0.5}
                  onChange={(v) => updateAssumption("cogsAI", v)}
                  format={(v) => `${v.toFixed(1)}%`}
                  color="#059669"
                />
                <SliderInput
                  label="Payment Processing"
                  value={assumptions.cogsPayment}
                  min={1}
                  max={5}
                  step={0.1}
                  onChange={(v) => updateAssumption("cogsPayment", v)}
                  format={(v) => `${v.toFixed(1)}%`}
                  color="#d97706"
                />
                <SliderInput
                  label="Cloud Infra"
                  value={assumptions.cogsCloud}
                  min={1}
                  max={10}
                  step={0.5}
                  onChange={(v) => updateAssumption("cogsCloud", v)}
                  format={(v) => `${v.toFixed(1)}%`}
                  color="#0891b2"
                />
                <SliderInput
                  label="Customer Support"
                  value={assumptions.cogsSupport}
                  min={1}
                  max={10}
                  step={0.5}
                  onChange={(v) => updateAssumption("cogsSupport", v)}
                  format={(v) => `${v.toFixed(1)}%`}
                  color="#7c3aed"
                />
                <p className="text-xs font-[family-name:var(--font-ibm-plex-mono)] text-[#1e293b]">
                  Total COGS:{" "}
                  <span
                    className={
                      totalCogsPct > 25
                        ? "text-[#dc2626]"
                        : "text-[#059669]"
                    }
                  >
                    {totalCogsPct.toFixed(1)}%
                  </span>
                </p>
              </div>
            </Card>

            {/* OpEx */}
            <Card className="p-4 sm:p-6" accent>
              <h3 className="text-base font-semibold text-[#1e293b] mb-4">
                Operating Expenses (RM M / year)
              </h3>
              <div className="space-y-3">
                {([
                  {
                    label: "Engineering",
                    key: "opexEngineering" as const,
                  },
                  {
                    label: "Sales & Marketing",
                    key: "opexMarketing" as const,
                  },
                  { label: "G&A", key: "opexGA" as const },
                ] as const).map((cat) => (
                  <div key={cat.key}>
                    <p className="text-xs text-[#64748b] mb-1.5">
                      {cat.label}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {(["Y1", "Y2", "Y3"] as const).map(
                        (yearLabel, i) => (
                          <NumberInput
                            key={yearLabel}
                            label={yearLabel}
                            value={assumptions[cat.key][i]}
                            prefix="RM"
                            suffix="M"
                            min={0}
                            max={50}
                            step={0.1}
                            onChange={(v) => {
                              const next = [
                                ...assumptions[cat.key],
                              ] as [number, number, number];
                              next[i] = v;
                              updateAssumption(cat.key, next);
                            }}
                          />
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Operations */}
            <Card className="p-4 sm:p-6" accent>
              <h3 className="text-base font-semibold text-[#1e293b] mb-4">
                Operations
              </h3>
              <div className="space-y-3">
                {([
                  { label: "MAU", key: "mau" as const, suffix: "" },
                  {
                    label: "Trips Booked",
                    key: "tripsBooked" as const,
                    suffix: "",
                  },
                  {
                    label: "B2B Subscribers",
                    key: "b2bSubs" as const,
                    suffix: "",
                  },
                  {
                    label: "Pro Subscribers",
                    key: "proSubs" as const,
                    suffix: "",
                  },
                  {
                    label: "Headcount",
                    key: "headcount" as const,
                    suffix: "",
                  },
                ] as const).map((item) => (
                  <div key={item.key}>
                    <p className="text-xs text-[#64748b] mb-1.5">
                      {item.label}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {(["Y1", "Y2", "Y3"] as const).map(
                        (yearLabel, i) => (
                          <NumberInput
                            key={yearLabel}
                            label={yearLabel}
                            value={assumptions[item.key][i]}
                            suffix={item.suffix}
                            min={0}
                            max={10000000}
                            step={1000}
                            onChange={(v) => {
                              const next = [
                                ...assumptions[item.key],
                              ] as [number, number, number];
                              next[i] = v;
                              updateAssumption(item.key, next);
                            }}
                          />
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Working Capital */}
            <Card className="p-4 sm:p-6" accent>
              <h3 className="text-base font-semibold text-[#1e293b] mb-4">
                Working Capital
              </h3>
              <div className="space-y-3">
                <SliderInput
                  label="Receivable Days"
                  value={assumptions.receivableDays}
                  min={15}
                  max={90}
                  step={5}
                  onChange={(v) => updateAssumption("receivableDays", v)}
                  format={(v) => `${v} days`}
                />
                <SliderInput
                  label="Payable Days"
                  value={assumptions.payableDays}
                  min={15}
                  max={90}
                  step={5}
                  onChange={(v) => updateAssumption("payableDays", v)}
                  format={(v) => `${v} days`}
                />
                <div>
                  <p className="text-xs text-[#64748b] mb-1.5">
                    CapEx (RM M / year)
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {(["Y1", "Y2", "Y3"] as const).map(
                      (yearLabel, i) => (
                        <NumberInput
                          key={yearLabel}
                          label={yearLabel}
                          value={assumptions.capex[i]}
                          prefix="RM"
                          suffix="M"
                          min={0}
                          max={10}
                          step={0.1}
                          onChange={(v) => {
                            const next = [...assumptions.capex] as [
                              number,
                              number,
                              number,
                            ];
                            next[i] = v;
                            updateAssumption("capex", next);
                          }}
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Cap Table */}
            <Card className="p-4 sm:p-6" accent>
              <h3 className="text-base font-semibold text-[#1e293b] mb-4">
                Cap Table & Funding Rounds
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#94a3b8] mb-2 font-[family-name:var(--font-ibm-plex-mono)] uppercase">
                    Current Round
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <NumberInput
                      label="Raise"
                      value={assumptions.currentRaise}
                      prefix="RM"
                      min={100000}
                      max={5000000}
                      step={50000}
                      onChange={(v) =>
                        updateAssumption("currentRaise", v)
                      }
                    />
                    <NumberInput
                      label="Pre-Money"
                      value={assumptions.currentValuation}
                      prefix="RM"
                      min={3000000}
                      max={20000000}
                      step={500000}
                      onChange={(v) =>
                        updateAssumption("currentValuation", v)
                      }
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#94a3b8] mb-2 font-[family-name:var(--font-ibm-plex-mono)] uppercase">
                    Seed Round Range
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <NumberInput
                      label="Raise Min"
                      value={assumptions.seedRaiseRange[0]}
                      prefix="RM"
                      min={1000000}
                      max={10000000}
                      step={500000}
                      onChange={(v) =>
                        updateAssumption("seedRaiseRange", [
                          v,
                          assumptions.seedRaiseRange[1],
                        ])
                      }
                    />
                    <NumberInput
                      label="Raise Max"
                      value={assumptions.seedRaiseRange[1]}
                      prefix="RM"
                      min={1000000}
                      max={20000000}
                      step={500000}
                      onChange={(v) =>
                        updateAssumption("seedRaiseRange", [
                          assumptions.seedRaiseRange[0],
                          v,
                        ])
                      }
                    />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-[#94a3b8] mb-2 font-[family-name:var(--font-ibm-plex-mono)] uppercase">
                    Series A Range
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <NumberInput
                      label="Raise Min"
                      value={assumptions.seriesARaiseRange[0]}
                      prefix="RM"
                      min={10000000}
                      max={100000000}
                      step={5000000}
                      onChange={(v) =>
                        updateAssumption("seriesARaiseRange", [
                          v,
                          assumptions.seriesARaiseRange[1],
                        ])
                      }
                    />
                    <NumberInput
                      label="Raise Max"
                      value={assumptions.seriesARaiseRange[1]}
                      prefix="RM"
                      min={10000000}
                      max={100000000}
                      step={5000000}
                      onChange={(v) =>
                        updateAssumption("seriesARaiseRange", [
                          assumptions.seriesARaiseRange[0],
                          v,
                        ])
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
