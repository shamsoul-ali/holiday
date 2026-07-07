'use client';

import React, { useState } from 'react';

const slides = [
  {
    id: 'cover',
    title: 'Andalusia Travel x Holiday AI',
    content: () => (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center mb-6">
          <span className="text-3xl text-white">☪</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Andalusia Travel</h1>
        <h2 className="text-2xl text-emerald-600 font-semibold mb-2">x Holiday AI</h2>
        <p className="text-xl text-gray-500 max-w-lg">Transformasi Digital untuk Agensi Umrah & Haji Terpercaya Malaysia</p>
        <div className="flex gap-4 mt-8">
          {['22 Tahun', '51,203 Jemaah', 'MATTA Award'].map((badge) => (
            <span key={badge} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">{badge}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'problem',
    title: 'Masalah',
    content: () => (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Masalah: Industri Umrah Masih Manual</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: '📋', title: 'Proses Manual', desc: 'Tempahan melalui telefon, WhatsApp, dan kaunter fizikal. Tiada platform digital bersepadu.' },
            { icon: '📊', title: 'Tiada Analitik', desc: '51,203 jemaah tapi tiada dashboard untuk memahami demografi dan trend pembelian.' },
            { icon: '🏪', title: 'Persaingan Online', desc: 'Agensi online baru mencuri pasaran dengan UX moden dan harga telus.' },
            { icon: '👤', title: 'Pengalaman Generik', desc: 'Semua jemaah dapat pakej yang sama. Tiada pemperibadian berdasarkan keperluan.' },
          ].map((item) => (
            <div key={item.title} className="bg-red-50 rounded-xl p-6 border border-red-100">
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'solution',
    title: 'Penyelesaian',
    content: () => (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Penyelesaian: Super App Umrah Berkuasa AI</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🤖', title: 'AI Ustaz', desc: 'Pembantu pintar yang memahami keperluan jemaah dan menyyor pakej terbaik', color: 'emerald' },
            { icon: '📱', title: 'Super App', desc: '6 tab: Beranda, Umrah, AI Ustaz, Tempahan, Ibadah, Profil — semua dalam satu app', color: 'blue' },
            { icon: '🕌', title: 'Ibadah Hub', desc: 'Waktu solat, kiblat, kursus umrah interaktif, doa dengan terjemahan BM', color: 'purple' },
            { icon: '💳', title: 'Pembayaran MY', desc: 'FPX, e-wallet, kad, BNPL, dan Dompet Andalusia — semua kaedah Malaysia', color: 'amber' },
            { icon: '📊', title: 'Dashboard', desc: 'Analitik 51K jemaah: demografi, jualan, trend — keputusan berasaskan data', color: 'cyan' },
            { icon: '🎁', title: 'Cabutan', desc: 'Cabutan umrah percuma mingguan — pemasaran viral yang mendorong pendaftaran', color: 'pink' },
          ].map((item) => (
            <div key={item.title} className={`bg-${item.color}-50 rounded-xl p-6 border border-${item.color}-100`} style={{ backgroundColor: item.color === 'emerald' ? '#ecfdf5' : item.color === 'blue' ? '#eff6ff' : item.color === 'purple' ? '#f5f3ff' : item.color === 'amber' ? '#fffbeb' : item.color === 'cyan' ? '#ecfeff' : '#fdf2f8' }}>
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'market',
    title: 'Pasaran',
    content: () => (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Data Pasaran: 51,203 Jemaah Berdaftar</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Jumlah Jemaah', value: '51,203' },
            { label: 'Wanita', value: '60%' },
            { label: 'Umur 36-55', value: '55%' },
            { label: 'M40 (Terbesar)', value: '50%' },
          ].map((stat) => (
            <div key={stat.label} className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Negeri Teratas</h3>
            {[{ n: 'Selangor', p: 25 }, { n: 'Johor', p: 15 }, { n: 'KL', p: 13 }, { n: 'Perak', p: 10 }, { n: 'Pulau Pinang', p: 9 }].map((s) => (
              <div key={s.n} className="flex items-center gap-2 mb-2">
                <span className="w-20 text-sm text-gray-600">{s.n}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${s.p}%` }} /></div>
                <span className="text-sm text-gray-500 w-10 text-right">{s.p}%</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Jualan Pakej</h3>
            {[{ n: 'Standard', v: 12300, c: '#3B82F6' }, { n: 'Ekonomi', v: 8450, c: '#10B981' }, { n: 'Premium', v: 5200, c: '#8B5CF6' }, { n: 'Plus', v: 3600, c: '#0891b2' }, { n: 'VIP', v: 1800, c: '#D97706' }].map((p) => (
              <div key={p.n} className="flex items-center gap-2 mb-2">
                <span className="w-20 text-sm text-gray-600">{p.n}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5"><div className="h-full rounded-full" style={{ width: `${(p.v / 12300) * 100}%`, backgroundColor: p.c }} /></div>
                <span className="text-sm text-gray-500 w-14 text-right">{p.v.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'product',
    title: 'Produk',
    content: () => (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Demo Produk</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ciri-ciri Utama</h3>
            <div className="space-y-3">
              {[
                'Wizard 4 langkah: Pakej → Tarikh → Tambahan → Semakan',
                'AI Ustaz: Chatbot panduan umrah pintar',
                'Pakej 4 tier: Ekonomi (RM6.3K) → VIP (RM11K)',
                'Jadual 10 hari: Madinah (3N) → Makkah (4N) → KUL',
                'Ibadah Hub: Solat, Kiblat, Kursus 8 modul, 12+ doa',
                'Visa tracker 4 peringkat & kursus progress',
                'Pembayaran: FPX, kad, e-wallet, BNPL, dompet',
                'Dashboard pentadbir: 51K jemaah analytics',
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">✓</span>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl p-8 text-white flex flex-col items-center justify-center">
            <span className="text-6xl mb-4">📱</span>
            <h3 className="text-xl font-bold mb-2">Andalusia Super App</h3>
            <p className="text-emerald-100 text-center mb-4">Muat turun demo di TestFlight</p>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <p className="text-sm">85 fail | 6 tab | 13 data files</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'technology',
    title: 'Teknologi',
    content: () => (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Tumpukan Teknologi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Mobile App', items: ['Expo SDK 55 / React Native', 'Expo Router v4', 'Zustand v5 State', 'Reanimated v4 Animations', 'TypeScript Strict'] },
            { title: 'AI & Backend', items: ['AI Trip Planning (GPT-4)', 'Bilingual BM/EN', 'Smart Package Matching', 'Umrah Knowledge Base', 'Real-time Notifications'] },
            { title: 'Pembayaran MY', items: ['FPX (8 bank)', 'E-Wallet (TnG/Boost/Grab)', 'Kad Kredit/Debit', 'BNPL Ansuran', 'Dompet Andalusia'] },
          ].map((stack) => (
            <div key={stack.title} className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-emerald-600 mb-4">{stack.title}</h3>
              <ul className="space-y-2">
                {stack.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-gray-700 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'business-model',
    title: 'Model Bisnes',
    content: () => (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Model Bisnes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aliran Pendapatan</h3>
            {[
              { stream: 'Komisen Pakej Umrah', pct: '15-28%', desc: 'Setiap tempahan berjaya' },
              { stream: 'SaaS Platform Fee', pct: 'RM5K/bln', desc: 'Yuran langganan teknologi' },
              { stream: 'Umrah Plus Commission', pct: '20%', desc: 'Pakej kombinasi pelancongan' },
              { stream: 'Insurans Takaful', pct: '8%', desc: 'Rujukan insurans perjalanan' },
              { stream: 'Premium Features', pct: 'RM10/bln', desc: 'AI Ustaz premium, kursus lanjutan' },
            ].map((item) => (
              <div key={item.stream} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{item.stream}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <span className="text-emerald-600 font-bold">{item.pct}</span>
              </div>
            ))}
          </div>
          <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kelebihan Persaingan</h3>
            <div className="space-y-4">
              {[
                { title: '22 Tahun Pengalaman', desc: 'Jenama dipercayai + teknologi AI = first mover' },
                { title: '51,203 Pangkalan Data', desc: 'Data jemaah sedia ada untuk personalisasi AI' },
                { title: 'Rakan Strategik', desc: 'MAS, Hilton, Pullman — tiada pesaing mampu tawar' },
                { title: 'Bilingual', desc: 'BM utama + EN — unik di pasaran Malaysia' },
              ].map((item) => (
                <div key={item.title}>
                  <p className="font-semibold text-emerald-700">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'revenue',
    title: 'Hasil',
    content: () => (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Unjuran Kewangan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Hasil Semasa', value: 'RM222M/thn', sub: 'Tanpa teknologi' },
            { label: 'Unjuran Y1', value: 'RM300M/thn', sub: '+35% pertumbuhan' },
            { label: 'Unjuran Y3', value: 'RM450M/thn', sub: '20% pasaran umrah' },
          ].map((item) => (
            <div key={item.label} className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-xl p-6 text-white text-center">
              <p className="text-sm text-emerald-200">{item.label}</p>
              <p className="text-3xl font-bold my-2">{item.value}</p>
              <p className="text-emerald-200 text-sm">{item.sub}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Pecahan Pakej (Semasa)</h3>
          <div className="space-y-3">
            {[
              { name: 'Umrah Standard', rev: 'RM97.1M', pct: 32 },
              { name: 'Umrah Ekonomi', rev: 'RM53.8M', pct: 18 },
              { name: 'Umrah Premium', rev: 'RM49.1M', pct: 16 },
              { name: 'Haji', rev: 'RM42.5M', pct: 14 },
              { name: 'Umrah Plus', rev: 'RM40.0M', pct: 13 },
              { name: 'Umrah VIP', rev: 'RM19.8M', pct: 7 },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-28 text-sm text-gray-600">{item.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3"><div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.pct}%` }} /></div>
                <span className="w-20 text-sm font-medium text-right">{item.rev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'the-ask',
    title: 'Pelaburan',
    content: () => (
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Cadangan Pelaburan</h2>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl p-8 text-white text-center mb-8">
          <p className="text-emerald-200 mb-2">Jumlah Pelaburan Diperlukan</p>
          <p className="text-5xl font-bold mb-2">RM3,000,000</p>
          <p className="text-emerald-200">ROI unjuran: 3.5x dalam 3 tahun | Pulang modal: 18 bulan</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Penggunaan Dana</h3>
            {[
              { use: 'Pembangunan Teknologi', amount: 'RM1.2M', pct: 40, color: '#059669' },
              { use: 'Pemasaran & Pertumbuhan', amount: 'RM750K', pct: 25, color: '#3B82F6' },
              { use: 'Operasi & Pengambilan', amount: 'RM600K', pct: 20, color: '#8B5CF6' },
              { use: 'Modal Kerja', amount: 'RM450K', pct: 15, color: '#D97706' },
            ].map((item) => (
              <div key={item.use} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">{item.use}</span>
                  <span className="text-sm font-medium">{item.amount} ({item.pct}%)</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2.5"><div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} /></div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            {[
              { phase: 'Bulan 1-3', title: 'MVP & Beta', desc: 'App siap, 500 beta testers' },
              { phase: 'Bulan 4-6', title: 'Pelancaran', desc: 'App Store, 5,000 pengguna' },
              { phase: 'Bulan 7-12', title: 'Pertumbuhan', desc: '20,000 pengguna, ROI positif' },
              { phase: 'Tahun 2-3', title: 'Skala', desc: '50,000+ pengguna, 20% pasaran' },
            ].map((item, i) => (
              <div key={item.phase} className="flex gap-3 mb-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  {i < 3 && <div className="w-0.5 h-8 bg-emerald-200" />}
                </div>
                <div>
                  <p className="text-xs text-emerald-600 font-medium">{item.phase}</p>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'contact',
    title: 'Hubungi',
    content: () => (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center mb-6">
          <span className="text-3xl text-white">☪</span>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Mari Bina Masa Depan Umrah</h2>
        <p className="text-xl text-gray-500 max-w-lg mb-8">Andalusia Travel x Holiday AI — 22 tahun pengalaman bertemu teknologi AI terkini</p>
        <div className="flex flex-col gap-3 text-gray-600">
          <p>📧 info@umrahandalusia.com</p>
          <p>🌐 www.umrahandalusia.com</p>
          <p>📍 25,27 & 29 Jalan 1/76, Kuala Lumpur 55100</p>
        </div>
        <div className="mt-8 flex gap-3">
          {['Malaysia Airlines', 'Hilton', 'Pullman'].map((p) => (
            <span key={p} className="px-4 py-2 bg-gray-100 text-gray-500 rounded-full text-sm">{p}</span>
          ))}
        </div>
      </div>
    ),
  },
];

export default function AndalusiaProposalPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-sm">☪</span>
            </div>
            <span className="font-semibold text-gray-900">Andalusia x Holiday AI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-emerald-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-400">{currentSlide + 1}/{slides.length}</span>
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {slide.content()}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-sm font-medium disabled:opacity-30 hover:bg-gray-200 transition-colors"
          >
            ← Sebelum
          </button>
          <div className="flex gap-2 overflow-x-auto">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(i)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${i === currentSlide ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {s.title}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium disabled:opacity-30 hover:bg-emerald-700 transition-colors"
          >
            Seterusnya →
          </button>
        </div>
      </div>
    </div>
  );
}
