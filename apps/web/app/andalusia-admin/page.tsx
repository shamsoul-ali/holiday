'use client';

import React, { useState } from 'react';

const stats = {
  totalJemaah: 51203,
  activeBookings: 3650,
  monthlyRevenue: 18500000,
  annualRevenue: 222000000,
  satisfaction: 4.7,
  totalReviews: 8420,
  conversionRate: 68.5,
  repeatRate: 42.3,
  avgBookingValue: 8250,
  cancelRate: 3.2,
  genderSplit: { male: 40, female: 60 },
  ageGroups: [
    { range: '18-25', count: 3584, percentage: 7 },
    { range: '26-35', count: 10241, percentage: 20 },
    { range: '36-45', count: 15361, percentage: 30 },
    { range: '46-55', count: 12801, percentage: 25 },
    { range: '56-65', count: 7169, percentage: 14 },
    { range: '65+', count: 2048, percentage: 4 },
  ],
  incomeGroups: [
    { group: 'B40', label: 'Bawah RM4,850/bln', count: 15361, percentage: 30 },
    { group: 'M40', label: 'RM4,850 - RM10,959/bln', count: 25602, percentage: 50 },
    { group: 'T20', label: 'Atas RM10,959/bln', count: 10241, percentage: 20 },
  ],
  topStates: [
    { name: 'Selangor', count: 12801, pct: 25.0 },
    { name: 'Johor', count: 7681, pct: 15.0 },
    { name: 'W.P. Kuala Lumpur', count: 6656, pct: 13.0 },
    { name: 'Perak', count: 5120, pct: 10.0 },
    { name: 'Pulau Pinang', count: 4608, pct: 9.0 },
    { name: 'Kelantan', count: 3584, pct: 7.0 },
    { name: 'Sabah', count: 3072, pct: 6.0 },
    { name: 'Sarawak', count: 2560, pct: 5.0 },
    { name: 'Negeri Sembilan', count: 2048, pct: 4.0 },
    { name: 'Lain-lain', count: 3073, pct: 6.0 },
  ],
  packageSales: [
    { name: 'Umrah Ekonomi', tier: 'Ekonomi', pax: 8450, revenue: 53800000, avgPrice: 6367, margin: 18 },
    { name: 'Umrah Standard', tier: 'Standard', pax: 12300, revenue: 97050000, avgPrice: 7890, margin: 22 },
    { name: 'Umrah Premium', tier: 'Premium', pax: 5200, revenue: 49140000, avgPrice: 9450, margin: 28 },
    { name: 'Umrah VIP', tier: 'VIP', pax: 1800, revenue: 19820000, avgPrice: 11013, margin: 35 },
    { name: 'Umrah Plus Istanbul', tier: 'Plus', pax: 2100, revenue: 23940000, avgPrice: 11400, margin: 25 },
    { name: 'Umrah Plus Dubai', tier: 'Plus', pax: 1500, revenue: 16050000, avgPrice: 10700, margin: 24 },
    { name: 'Haji (Muassasah)', tier: 'Haji', pax: 850, revenue: 42500000, avgPrice: 50000, margin: 15 },
  ],
  monthlyTrend: [
    { month: 'Jan', bookings: 2800, revenue: 16.5, prev: 2500 },
    { month: 'Feb', bookings: 3100, revenue: 18.2, prev: 2700 },
    { month: 'Mar', bookings: 3400, revenue: 19.8, prev: 2900 },
    { month: 'Apr', bookings: 3200, revenue: 18.9, prev: 3000 },
    { month: 'May', bookings: 2900, revenue: 17.1, prev: 2600 },
    { month: 'Jun', bookings: 2600, revenue: 15.3, prev: 2400 },
    { month: 'Jul', bookings: 3500, revenue: 20.5, prev: 3100 },
    { month: 'Aug', bookings: 3800, revenue: 22.3, prev: 3300 },
    { month: 'Sep', bookings: 3300, revenue: 19.4, prev: 2800 },
    { month: 'Oct', bookings: 3100, revenue: 18.2, prev: 2700 },
    { month: 'Nov', bookings: 2700, revenue: 15.9, prev: 2500 },
    { month: 'Dec', bookings: 2500, revenue: 14.7, prev: 2300 },
  ],
  pipeline: [
    { stage: 'Pertanyaan Masuk', count: 15200 },
    { stage: 'Pakej Dipilih', count: 10400 },
    { stage: 'Pembayaran Dimulakan', count: 7800 },
    { stage: 'Tempahan Disahkan', count: 6500 },
    { stage: 'Perjalanan Selesai', count: 5800 },
  ],
  mutawif: [
    { name: 'Ustaz Ahmad Faizal', groups: 48, rating: 4.9, jemaah: 720, satisfaction: 98 },
    { name: 'Ustazah Nor Hidayah', groups: 42, rating: 4.8, jemaah: 630, satisfaction: 96 },
    { name: 'Ustaz Mohd Rizal', groups: 38, rating: 4.7, jemaah: 570, satisfaction: 95 },
    { name: 'Ustaz Ibrahim Khalil', groups: 35, rating: 4.7, jemaah: 525, satisfaction: 94 },
    { name: 'Ustazah Siti Khadijah', groups: 32, rating: 4.6, jemaah: 480, satisfaction: 93 },
  ],
  kursus: [
    { module: 'Niat & Persiapan', completion: 92 },
    { module: 'Ihram & Miqat', completion: 88 },
    { module: 'Tawaf', completion: 85 },
    { module: 'Saie', completion: 82 },
    { module: 'Tahallul', completion: 78 },
    { module: 'Ziarah Makkah', completion: 74 },
    { module: 'Ziarah Madinah', completion: 70 },
    { module: 'Adab & Doa', completion: 65 },
  ],
  visa: { notStarted: 450, submitted: 820, processing: 1200, approved: 1180 },
  ops: {
    avgResponse: '2.4 jam',
    complaintRate: 1.8,
    refundRate: 2.1,
    groupSize: 15,
    flightOnTime: 94.2,
    hotelRating: 4.5,
  },
};

function Arrow({ up }: { up: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`inline-block ${up ? '' : 'rotate-180'}`}>
      <path d="M6 2.5V9.5M6 2.5L3 5.5M6 2.5L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Dot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />;
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'blue' }) {
  const cls = {
    default: 'bg-[#f5f5f5] text-[#666]',
    success: 'bg-[#e8f5e9] text-[#1a7f37]',
    warning: 'bg-[#fff8e1] text-[#9a6700]',
    blue: 'bg-[#e3f2fd] text-[#0550ae]',
  }[variant];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>{children}</span>;
}

export default function AndalusiaAdminPage() {
  const [tab, setTab] = useState<'overview' | 'demographics' | 'sales' | 'operations'>('overview');
  const totalPax = stats.packageSales.reduce((s, p) => s + p.pax, 0);
  const totalRev = stats.packageSales.reduce((s, p) => s + p.revenue, 0);
  const maxB = Math.max(...stats.monthlyTrend.map(m => Math.max(m.bookings, m.prev)));

  const tabs = [
    { key: 'overview' as const, label: 'Ringkasan' },
    { key: 'demographics' as const, label: 'Demografi' },
    { key: 'sales' as const, label: 'Jualan' },
    { key: 'operations' as const, label: 'Operasi' },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' }}>
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#eaeaea]">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-semibold text-[#171717] tracking-tight">Andalusia Travel</span>
            <span className="text-[#d4d4d4]">/</span>
            <span className="text-[13px] text-[#666]">Dashboard</span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-[#999]">
            <span><Dot />Sistem aktif</span>
            <span>Kemaskini: 5 Mac 2026</span>
          </div>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="border-b border-[#eaeaea]">
        <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-0">
          <h1 className="text-[28px] font-bold text-[#171717] tracking-tight leading-tight">Pengurusan Jemaah</h1>
          <p className="text-[14px] text-[#666] mt-1 mb-6">Analitik dan statistik operasi Andalusia Travel & Tours Sdn Bhd</p>
          <div className="flex gap-0 border-b-0">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-[13px] font-medium transition-colors relative ${
                  tab === t.key ? 'text-[#171717]' : 'text-[#999] hover:text-[#666]'
                }`}
              >
                {t.label}
                {tab === t.key && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171717] rounded-t" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* ═══════ OVERVIEW ═══════ */}
        {tab === 'overview' && (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-px bg-[#eaeaea] rounded-lg overflow-hidden border border-[#eaeaea]">
              {[
                { label: 'Jumlah Jemaah', value: stats.totalJemaah.toLocaleString(), change: 12.4 },
                { label: 'Tempahan Aktif', value: stats.activeBookings.toLocaleString(), change: 8.2 },
                { label: 'Hasil Bulanan', value: `RM ${(stats.monthlyRevenue / 1e6).toFixed(1)}J`, change: 14.5 },
                { label: 'Penilaian', value: `${stats.satisfaction} / 5.0`, sub: `${stats.totalReviews.toLocaleString()} ulasan` },
              ].map((k) => (
                <div key={k.label} className="bg-white p-5">
                  <p className="text-[12px] text-[#999] mb-1">{k.label}</p>
                  <p className="text-[24px] font-semibold text-[#171717] tracking-tight">{k.value}</p>
                  {k.change !== undefined && (
                    <p className="text-[12px] text-[#1a7f37] mt-1 flex items-center gap-1"><Arrow up /> +{k.change}%</p>
                  )}
                  {k.sub && <p className="text-[11px] text-[#999] mt-1">{k.sub}</p>}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-px bg-[#eaeaea] rounded-lg overflow-hidden border border-[#eaeaea]">
              {[
                { label: 'Hasil Tahunan', value: `RM ${(stats.annualRevenue / 1e6).toFixed(0)}J`, change: 18.7 },
                { label: 'Kadar Penukaran', value: `${stats.conversionRate}%`, change: 3.1 },
                { label: 'Jemaah Berulang', value: `${stats.repeatRate}%`, change: 5.6 },
                { label: 'Purata Tempahan', value: `RM ${stats.avgBookingValue.toLocaleString()}`, change: 6.8 },
              ].map((k) => (
                <div key={k.label} className="bg-white p-5">
                  <p className="text-[12px] text-[#999] mb-1">{k.label}</p>
                  <p className="text-[24px] font-semibold text-[#171717] tracking-tight">{k.value}</p>
                  <p className="text-[12px] text-[#1a7f37] mt-1 flex items-center gap-1"><Arrow up /> +{k.change}%</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="border border-[#eaeaea] rounded-lg">
              <div className="px-5 py-4 border-b border-[#eaeaea] flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-semibold text-[#171717]">Trend Tempahan</h3>
                  <p className="text-[12px] text-[#999]">Perbandingan tahun semasa vs tahun lepas</p>
                </div>
                <div className="flex items-center gap-5 text-[11px] text-[#999]">
                  <span className="flex items-center gap-1.5"><span className="w-6 h-[3px] rounded-full bg-[#171717]" /> 2026</span>
                  <span className="flex items-center gap-1.5"><span className="w-6 h-[3px] rounded-full bg-[#e5e5e5]" /> 2025</span>
                </div>
              </div>
              <div className="px-5 py-6">
                <div className="flex items-end gap-[6px]" style={{ height: 208 }}>
                  {stats.monthlyTrend.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center group relative" style={{ height: '100%' }}>
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#171717] text-white text-[11px] rounded-md px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-mono">
                        {m.bookings.toLocaleString()} &middot; RM {m.revenue}J
                      </div>
                      <div className="w-full flex gap-[2px] items-end" style={{ flex: 1 }}>
                        <div className="flex-1 bg-[#eaeaea] rounded-sm transition-all" style={{ height: `${(m.prev / maxB) * 100}%`, minHeight: 4 }} />
                        <div className="flex-1 bg-[#171717] rounded-sm transition-all group-hover:bg-[#444]" style={{ height: `${(m.bookings / maxB) * 100}%`, minHeight: 4 }} />
                      </div>
                      <span className="text-[11px] text-[#999] mt-2 font-mono">{m.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Pipeline */}
              <div className="border border-[#eaeaea] rounded-lg">
                <div className="px-5 py-4 border-b border-[#eaeaea]">
                  <h3 className="text-[14px] font-semibold text-[#171717]">Corong Penukaran</h3>
                  <p className="text-[12px] text-[#999]">Dari pertanyaan hingga selesai</p>
                </div>
                <div className="p-5 space-y-4">
                  {stats.pipeline.map((s, i) => {
                    const max = stats.pipeline[0].count;
                    const prev = i > 0 ? stats.pipeline[i - 1].count : s.count;
                    const drop = i > 0 ? ((1 - s.count / prev) * 100).toFixed(1) : null;
                    return (
                      <div key={s.stage}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[13px] text-[#171717]">{s.stage}</span>
                          <span className="text-[13px] font-mono font-medium text-[#171717]">{s.count.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-[#f5f5f5] rounded-full h-[6px] overflow-hidden">
                            <div className="h-full rounded-full bg-[#171717] transition-all" style={{ width: `${(s.count / max) * 100}%` }} />
                          </div>
                          {drop && <span className="text-[11px] text-[#999] font-mono w-12 text-right">-{drop}%</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t border-[#eaeaea] flex justify-between">
                    <span className="text-[12px] text-[#999]">Penukaran keseluruhan</span>
                    <span className="text-[13px] font-semibold font-mono text-[#171717]">
                      {((stats.pipeline[stats.pipeline.length - 1].count / stats.pipeline[0].count) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Revenue split */}
              <div className="border border-[#eaeaea] rounded-lg">
                <div className="px-5 py-4 border-b border-[#eaeaea]">
                  <h3 className="text-[14px] font-semibold text-[#171717]">Pecahan Hasil</h3>
                  <p className="text-[12px] text-[#999]">RM {(totalRev / 1e6).toFixed(1)}J daripada {totalPax.toLocaleString()} pax</p>
                </div>
                <div className="p-5">
                  {/* Stacked bar */}
                  <div className="flex rounded h-3 overflow-hidden mb-5">
                    {stats.packageSales.map((p, i) => {
                      const colors = ['#171717', '#444', '#666', '#888', '#aaa', '#ccc', '#ddd'];
                      return <div key={p.name} className="h-full" style={{ width: `${(p.revenue / totalRev) * 100}%`, backgroundColor: colors[i] }} />;
                    })}
                  </div>
                  <div className="space-y-2.5">
                    {stats.packageSales.map((p, i) => {
                      const colors = ['#171717', '#444', '#666', '#888', '#aaa', '#ccc', '#ddd'];
                      return (
                        <div key={p.name} className="flex items-center gap-3 text-[13px]">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[i] }} />
                          <span className="text-[#666] flex-1">{p.name}</span>
                          <span className="font-mono text-[#171717] font-medium">RM {(p.revenue / 1e6).toFixed(1)}J</span>
                          <span className="font-mono text-[#999] w-10 text-right">{((p.revenue / totalRev) * 100).toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Visa */}
            <div className="border border-[#eaeaea] rounded-lg">
              <div className="px-5 py-4 border-b border-[#eaeaea]">
                <h3 className="text-[14px] font-semibold text-[#171717]">Status Visa</h3>
              </div>
              <div className="grid grid-cols-4 divide-x divide-[#eaeaea]">
                {[
                  { label: 'Belum Mula', count: stats.visa.notStarted },
                  { label: 'Dihantar', count: stats.visa.submitted },
                  { label: 'Dalam Proses', count: stats.visa.processing },
                  { label: 'Diluluskan', count: stats.visa.approved },
                ].map((v) => (
                  <div key={v.label} className="p-5 text-center">
                    <p className="text-[24px] font-semibold text-[#171717] font-mono">{v.count.toLocaleString()}</p>
                    <p className="text-[12px] text-[#999] mt-1">{v.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════ DEMOGRAPHICS ═══════ */}
        {tab === 'demographics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Gender */}
              <div className="border border-[#eaeaea] rounded-lg">
                <div className="px-5 py-4 border-b border-[#eaeaea]">
                  <h3 className="text-[14px] font-semibold text-[#171717]">Jantina</h3>
                  <p className="text-[12px] text-[#999]">{stats.totalJemaah.toLocaleString()} jemaah berdaftar</p>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-8">
                    {/* Ring */}
                    <div className="relative w-36 h-36 shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#eaeaea" strokeWidth="2.5" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="#171717" strokeWidth="2.5"
                          strokeDasharray={`${stats.genderSplit.female * 0.88} ${100}`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-[20px] font-semibold text-[#171717] font-mono">{stats.genderSplit.female}%</p>
                        <p className="text-[11px] text-[#999]">Wanita</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="p-3 rounded-lg bg-[#fafafa]">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[13px] text-[#171717] font-medium">Wanita</span>
                          <span className="text-[15px] font-semibold text-[#171717] font-mono">{stats.genderSplit.female}%</span>
                        </div>
                        <p className="text-[11px] text-[#999] mt-0.5">{Math.round(stats.totalJemaah * 0.6).toLocaleString()} jemaah</p>
                      </div>
                      <div className="p-3 rounded-lg bg-[#fafafa]">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[13px] text-[#171717] font-medium">Lelaki</span>
                          <span className="text-[15px] font-semibold text-[#171717] font-mono">{stats.genderSplit.male}%</span>
                        </div>
                        <p className="text-[11px] text-[#999] mt-0.5">{Math.round(stats.totalJemaah * 0.4).toLocaleString()} jemaah</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Age */}
              <div className="border border-[#eaeaea] rounded-lg">
                <div className="px-5 py-4 border-b border-[#eaeaea]">
                  <h3 className="text-[14px] font-semibold text-[#171717]">Kumpulan Umur</h3>
                  <p className="text-[12px] text-[#999]">Majoriti berumur 36-55 tahun</p>
                </div>
                <div className="p-5 space-y-3">
                  {stats.ageGroups.map((g) => (
                    <div key={g.range} className="flex items-center gap-3">
                      <span className="w-12 text-[13px] font-mono text-[#666] shrink-0">{g.range}</span>
                      <div className="flex-1 bg-[#f5f5f5] rounded h-[22px] overflow-hidden">
                        <div className="h-full rounded bg-[#171717] transition-all flex items-center" style={{ width: `${(g.percentage / 30) * 100}%` }}>
                          {g.percentage >= 14 && <span className="text-[11px] text-white font-mono pl-2">{g.percentage}%</span>}
                        </div>
                      </div>
                      <span className="w-16 text-[13px] font-mono text-[#171717] text-right">{g.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Income */}
              <div className="border border-[#eaeaea] rounded-lg">
                <div className="px-5 py-4 border-b border-[#eaeaea]">
                  <h3 className="text-[14px] font-semibold text-[#171717]">Pendapatan Isi Rumah</h3>
                  <p className="text-[12px] text-[#999]">Klasifikasi pendapatan Malaysia</p>
                </div>
                <div className="p-5 space-y-3">
                  {stats.incomeGroups.map((g) => (
                    <div key={g.group} className="p-4 rounded-lg border border-[#eaeaea]">
                      <div className="flex items-baseline justify-between mb-2">
                        <div>
                          <span className="text-[14px] font-semibold text-[#171717]">{g.group}</span>
                          <span className="text-[12px] text-[#999] ml-2">{g.label}</span>
                        </div>
                        <span className="text-[18px] font-semibold text-[#171717] font-mono">{g.percentage}%</span>
                      </div>
                      <div className="bg-[#f5f5f5] rounded-full h-[5px] overflow-hidden">
                        <div className="h-full rounded-full bg-[#171717] transition-all" style={{ width: `${g.percentage}%` }} />
                      </div>
                      <p className="text-[11px] text-[#999] mt-2 font-mono">{g.count.toLocaleString()} jemaah</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* States */}
              <div className="border border-[#eaeaea] rounded-lg">
                <div className="px-5 py-4 border-b border-[#eaeaea]">
                  <h3 className="text-[14px] font-semibold text-[#171717]">Negeri</h3>
                  <p className="text-[12px] text-[#999]">Taburan pendaftaran mengikut negeri</p>
                </div>
                <div className="divide-y divide-[#eaeaea]">
                  {stats.topStates.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#fafafa] transition-colors">
                      <span className="w-5 text-[12px] text-[#ccc] font-mono">{i + 1}</span>
                      <span className="text-[13px] text-[#171717] flex-1">{s.name}</span>
                      <span className="text-[12px] font-mono text-[#999]">{s.count.toLocaleString()}</span>
                      <div className="w-20 bg-[#f5f5f5] rounded-full h-[4px] overflow-hidden">
                        <div className="h-full rounded-full bg-[#171717]" style={{ width: `${(s.pct / 25) * 100}%` }} />
                      </div>
                      <span className="text-[12px] font-mono text-[#171717] w-10 text-right font-medium">{s.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ SALES ═══════ */}
        {tab === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-px bg-[#eaeaea] rounded-lg overflow-hidden border border-[#eaeaea]">
              <div className="bg-white p-5">
                <p className="text-[12px] text-[#999]">Jumlah Pax</p>
                <p className="text-[28px] font-semibold text-[#171717] tracking-tight font-mono">{totalPax.toLocaleString()}</p>
                <p className="text-[11px] text-[#999] mt-0.5">7 jenis pakej</p>
              </div>
              <div className="bg-white p-5">
                <p className="text-[12px] text-[#999]">Jumlah Hasil</p>
                <p className="text-[28px] font-semibold text-[#171717] tracking-tight font-mono">RM {(totalRev / 1e6).toFixed(1)}J</p>
                <p className="text-[11px] text-[#999] mt-0.5">Hasil kasar tahunan</p>
              </div>
              <div className="bg-white p-5">
                <p className="text-[12px] text-[#999]">Purata Per Pax</p>
                <p className="text-[28px] font-semibold text-[#171717] tracking-tight font-mono">RM {Math.round(totalRev / totalPax).toLocaleString()}</p>
                <p className="text-[11px] text-[#999] mt-0.5">Merentasi semua pakej</p>
              </div>
            </div>

            {/* Table */}
            <div className="border border-[#eaeaea] rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#eaeaea] bg-[#fafafa]">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider">Pakej</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider">Tier</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-[#999] uppercase tracking-wider">Harga Purata</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-[#999] uppercase tracking-wider">Pax</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-[#999] uppercase tracking-wider">Hasil</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-[#999] uppercase tracking-wider">Margin</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-[#999] uppercase tracking-wider">Syer</th>
                    <th className="px-5 py-3 w-28" />
                  </tr>
                </thead>
                <tbody>
                  {stats.packageSales.map((p) => (
                    <tr key={p.name} className="border-b border-[#eaeaea] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3.5 text-[13px] font-medium text-[#171717]">{p.name}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant={p.tier === 'VIP' ? 'warning' : p.tier === 'Premium' ? 'blue' : 'default'}>{p.tier}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-mono text-[#666]">RM {p.avgPrice.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-mono text-[#171717]">{p.pax.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-mono font-semibold text-[#171717]">RM {(p.revenue / 1e6).toFixed(1)}J</td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-mono">
                        <span className={p.margin >= 25 ? 'text-[#1a7f37]' : 'text-[#666]'}>{p.margin}%</span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[13px] font-mono text-[#999]">{((p.revenue / totalRev) * 100).toFixed(1)}%</td>
                      <td className="px-5 py-3.5">
                        <div className="bg-[#f5f5f5] rounded-full h-[4px] overflow-hidden">
                          <div className="h-full rounded-full bg-[#171717]" style={{ width: `${(p.revenue / totalRev) * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#fafafa]">
                    <td className="px-5 py-3 text-[13px] font-semibold text-[#171717]" colSpan={2}>Jumlah</td>
                    <td className="px-5 py-3 text-right text-[13px] font-mono font-semibold text-[#171717]">RM {Math.round(totalRev / totalPax).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-[13px] font-mono font-semibold text-[#171717]">{totalPax.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-[13px] font-mono font-semibold text-[#171717]">RM {(totalRev / 1e6).toFixed(1)}J</td>
                    <td className="px-5 py-3 text-right text-[13px] font-mono font-semibold text-[#171717]">
                      {(stats.packageSales.reduce((s, p) => s + p.margin * p.revenue, 0) / totalRev).toFixed(1)}%
                    </td>
                    <td className="px-5 py-3 text-right text-[13px] font-mono font-semibold text-[#171717]">100%</td>
                    <td className="px-5 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Monthly Revenue */}
            <div className="border border-[#eaeaea] rounded-lg">
              <div className="px-5 py-4 border-b border-[#eaeaea]">
                <h3 className="text-[14px] font-semibold text-[#171717]">Hasil Bulanan</h3>
                <p className="text-[12px] text-[#999]">RM Juta, tahun 2026</p>
              </div>
              <div className="px-5 py-6">
                <div className="flex items-end gap-[6px] h-44">
                  {stats.monthlyTrend.map((m) => {
                    const maxR = Math.max(...stats.monthlyTrend.map(x => x.revenue));
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#171717] text-white text-[11px] rounded-md px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono z-10">
                          RM {m.revenue}J
                        </div>
                        <div className="w-full bg-[#171717] hover:bg-[#333] rounded-sm transition-all cursor-default" style={{ height: `${(m.revenue / maxR) * 100}%` }} />
                        <span className="text-[11px] text-[#999] font-mono">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ OPERATIONS ═══════ */}
        {tab === 'operations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-px bg-[#eaeaea] rounded-lg overflow-hidden border border-[#eaeaea]">
              {[
                { label: 'Masa Tindak Balas', value: stats.ops.avgResponse, sub: 'Purata pertanyaan ke jawapan' },
                { label: 'Kadar Aduan', value: `${stats.ops.complaintRate}%`, sub: 'Daripada jumlah tempahan' },
                { label: 'Kadar Bayaran Balik', value: `${stats.ops.refundRate}%`, sub: 'Daripada jumlah tempahan' },
              ].map((m) => (
                <div key={m.label} className="bg-white p-5">
                  <p className="text-[12px] text-[#999]">{m.label}</p>
                  <p className="text-[24px] font-semibold text-[#171717] tracking-tight">{m.value}</p>
                  <p className="text-[11px] text-[#999] mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-px bg-[#eaeaea] rounded-lg overflow-hidden border border-[#eaeaea]">
              {[
                { label: 'Saiz Kumpulan', value: `${stats.ops.groupSize} pax`, sub: 'Purata per kumpulan' },
                { label: 'Penerbangan Tepat Masa', value: `${stats.ops.flightOnTime}%`, sub: 'Malaysia Airlines' },
                { label: 'Penilaian Hotel', value: `${stats.ops.hotelRating} / 5.0`, sub: 'Purata hotel rakan kongsi' },
              ].map((m) => (
                <div key={m.label} className="bg-white p-5">
                  <p className="text-[12px] text-[#999]">{m.label}</p>
                  <p className="text-[24px] font-semibold text-[#171717] tracking-tight">{m.value}</p>
                  <p className="text-[11px] text-[#999] mt-0.5">{m.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Mutawif */}
              <div className="border border-[#eaeaea] rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-[#eaeaea]">
                  <h3 className="text-[14px] font-semibold text-[#171717]">Prestasi Mutawif</h3>
                  <p className="text-[12px] text-[#999]">5 teratas mengikut penilaian</p>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#eaeaea] bg-[#fafafa]">
                      <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-[#999] uppercase tracking-wider">Nama</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-[#999] uppercase tracking-wider">Kump</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-[#999] uppercase tracking-wider">Jemaah</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-[#999] uppercase tracking-wider">Rating</th>
                      <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-[#999] uppercase tracking-wider">Puas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.mutawif.map((m) => (
                      <tr key={m.name} className="border-b border-[#eaeaea] last:border-0 hover:bg-[#fafafa] transition-colors">
                        <td className="px-5 py-3 text-[13px] text-[#171717]">{m.name}</td>
                        <td className="px-3 py-3 text-right text-[13px] font-mono text-[#666]">{m.groups}</td>
                        <td className="px-3 py-3 text-right text-[13px] font-mono text-[#666]">{m.jemaah}</td>
                        <td className="px-3 py-3 text-right text-[13px] font-mono font-semibold text-[#171717]">{m.rating}</td>
                        <td className="px-5 py-3 text-right">
                          <Badge variant="success">{m.satisfaction}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Kursus */}
              <div className="border border-[#eaeaea] rounded-lg">
                <div className="px-5 py-4 border-b border-[#eaeaea]">
                  <h3 className="text-[14px] font-semibold text-[#171717]">Penyiapan Kursus</h3>
                  <p className="text-[12px] text-[#999]">Purata penyiapan modul oleh jemaah aktif</p>
                </div>
                <div className="p-5 space-y-3.5">
                  {stats.kursus.map((k) => (
                    <div key={k.module}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] text-[#171717]">{k.module}</span>
                        <span className="text-[13px] font-mono font-medium text-[#171717]">{k.completion}%</span>
                      </div>
                      <div className="bg-[#f5f5f5] rounded-full h-[5px] overflow-hidden">
                        <div className="h-full rounded-full bg-[#171717] transition-all" style={{ width: `${k.completion}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-[#eaeaea] flex justify-between">
                    <span className="text-[12px] text-[#999]">Purata keseluruhan</span>
                    <span className="text-[13px] font-semibold font-mono text-[#171717]">
                      {Math.round(stats.kursus.reduce((s, k) => s + k.completion, 0) / stats.kursus.length)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Partners */}
            <div className="border border-[#eaeaea] rounded-lg">
              <div className="px-5 py-4 border-b border-[#eaeaea]">
                <h3 className="text-[14px] font-semibold text-[#171717]">Rakan Kongsi</h3>
              </div>
              <div className="grid grid-cols-4 divide-x divide-[#eaeaea]">
                {[
                  { name: 'Malaysia Airlines', type: 'Penerbangan', detail: 'KUL-JED/MED terus' },
                  { name: 'Hilton Hotels', type: 'Penginapan', detail: 'Makkah & Madinah' },
                  { name: 'Pullman Hotels', type: 'Penginapan', detail: 'Pullman Zamzam' },
                  { name: 'Tabung Haji', type: 'Kewangan', detail: 'Simpanan & pembiayaan' },
                ].map((p) => (
                  <div key={p.name} className="p-5">
                    <p className="text-[13px] font-semibold text-[#171717]">{p.name}</p>
                    <p className="text-[11px] text-[#999] mt-0.5">{p.type}</p>
                    <p className="text-[12px] text-[#666] mt-1">{p.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#eaeaea] mt-12">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between text-[11px] text-[#999]">
          <span>Andalusia Travel & Tours Sdn Bhd</span>
          <span>Data simulasi untuk tujuan demonstrasi</span>
        </div>
      </footer>
    </div>
  );
}
