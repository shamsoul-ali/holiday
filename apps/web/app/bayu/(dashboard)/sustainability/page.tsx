'use client';

import { motion } from 'framer-motion';
import { Leaf, Waves, Users2, Award, Trash2, Sparkles, Cloud, TreePine, ShieldCheck, TrendingUp } from 'lucide-react';
import { TopBar } from '../../_components/TopBar';
import { Section } from '../../_components/Section';
import { Sustainability } from '../../_components/Sustainability';
import { Sparkline } from '../../_components/Sparkline';
import { stats } from '../../_data/stats';

// Synthetic detailed ESG indicators for the demo
const ESG = {
  environmental: [
    { label: 'CO₂ offset (tonnes)', value: stats.sustainability.carbonOffsetTonnes, yoy: 18.2, target: 30000 },
    { label: 'Reef protected (ha)',  value: stats.sustainability.reefProtectedHectares, yoy:  9.4, target: 1200 },
    { label: 'Waste diverted (%)',   value: stats.sustainability.wasteReduction, yoy: 7.1, target: 60 },
    { label: 'Plastic-free islands', value: stats.sustainability.plasticFreeIslands, yoy: 33.3, target: 18 },
  ],
  social: [
    { label: 'Local jobs created', value: stats.sustainability.localJobsCreated, yoy: 12.8, target: 20000 },
    { label: 'Women in tourism workforce (%)', value: 46, yoy: 4.6, target: 50 },
    { label: 'Indigenous homestays', value: 840, yoy: 22.0, target: 1000 },
    { label: 'Community revenue share (%)', value: 28, yoy: 6.1, target: 35 },
  ],
  governance: [
    { label: 'Eco-certified operators (%)', value: stats.sustainability.ecoCertifiedOperators, yoy: 9.2, target: 90 },
    { label: 'MOTAC audit compliance', value: 83, yoy: 7.4, target: 95 },
    { label: 'Safety incidents (per 10K)', value: 2.1, yoy: -14, target: 1.5, lowerIsBetter: true },
    { label: 'Marine permits honoured', value: 98, yoy: 1.2, target: 99 },
  ],
};

const CARBON_TREND = [17500, 18200, 19100, 20300, 21000, 21900, 22400, 23100, 23800, 24000, 24200, 24380];

export default function SustainabilityPage() {
  const score = stats.sustainabilityScore;

  return (
    <>
      <TopBar title="Sustainability Scorecard" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1600px] space-y-6 p-6 lg:p-8">
          {/* Hero */}
          <div className="relative overflow-hidden rounded-2xl border border-bayu-line bg-bayu-bg1">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  'radial-gradient(1000px 400px at 12% 18%, rgba(16, 185, 129, 0.2), transparent 62%),' +
                  'radial-gradient(700px 320px at 90% 92%, rgba(46, 175, 232, 0.16), transparent 60%)',
              }}
            />
            <div className="relative grid grid-cols-12 gap-6 p-8">
              <div className="col-span-12 md:col-span-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-bayu-textDim">
                  Sabah sustainability score
                </div>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-display text-7xl font-bold text-bayu-jungle tabular-nums">{score}</span>
                  <span className="text-base font-medium text-bayu-textMuted">/ 100</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-bayu-jungle/15 px-2 py-1 text-xs font-bold text-bayu-jungle">
                  <TrendingUp className="h-3 w-3" />+4.8 pts YoY · above APAC average (62)
                </div>
                <p className="mt-4 max-w-md text-sm text-bayu-textMuted leading-snug">
                  Composite of environmental, social, and governance metrics across tourism operators,
                  protected areas, and community revenue-share programs. Audited quarterly.
                </p>
              </div>

              <div className="col-span-12 md:col-span-7 md:border-l md:border-bayu-line md:pl-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
                  Pillars
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <Pillar icon={TreePine} label="Environmental" score={82} color="#10B981" />
                  <Pillar icon={Users2} label="Social" score={76} color="#2EAFE8" />
                  <Pillar icon={ShieldCheck} label="Governance" score={78} color="#A78BFA" />
                </div>
              </div>
            </div>
          </div>

          {/* Gauge + impact tiles */}
          <Section title="Impact summary" subtitle="Headline indicators at a glance">
            <Sustainability />
          </Section>

          {/* ESG breakdowns */}
          {(['environmental', 'social', 'governance'] as const).map((pillar) => (
            <Section
              key={pillar}
              title={pillar[0].toUpperCase() + pillar.slice(1) + ' indicators'}
              subtitle={`${ESG[pillar].length} metrics tracked · % against 2028 target`}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {ESG[pillar].map((m, i) => {
                  const pct = m.lowerIsBetter
                    ? Math.max(0, Math.min(100, (m.target / m.value) * 100))
                    : Math.min(100, (m.value / m.target) * 100);
                  const color = pillar === 'environmental' ? '#10B981' : pillar === 'social' ? '#2EAFE8' : '#A78BFA';
                  const positive = (m.lowerIsBetter ? m.yoy < 0 : m.yoy >= 0);
                  return (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.35 }}
                      className="rounded-xl border border-bayu-line bg-bayu-bg1 p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-bayu-textMuted">
                          {m.label}
                        </div>
                        <span className={`text-[10px] font-bold ${positive ? 'text-bayu-jungle' : 'text-bayu-coral'}`}>
                          {m.yoy >= 0 ? '+' : ''}
                          {m.yoy.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="font-display text-2xl font-bold text-bayu-text">
                          {m.value.toLocaleString('en-MY')}
                        </span>
                        <span className="text-[10px] text-bayu-textDim">of {m.target.toLocaleString('en-MY')}</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bayu-bg2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.2 + i * 0.04, duration: 0.7 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <div className="mt-1 text-[10px] text-bayu-textDim">{pct.toFixed(0)}% to target</div>
                    </motion.div>
                  );
                })}
              </div>
            </Section>
          ))}

          {/* Carbon trend */}
          <Section
            title="Carbon offset trend"
            subtitle="Tonnes of CO₂ offset through tourism-linked projects"
            kicker="+39% over 12 months"
          >
            <div className="rounded-xl border border-bayu-line bg-bayu-bg2/40 p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="font-display text-3xl font-bold text-bayu-jungle">
                    {stats.sustainability.carbonOffsetTonnes.toLocaleString('en-MY')}
                    <span className="ml-2 text-sm font-medium text-bayu-textMuted">tonnes CO₂</span>
                  </div>
                  <div className="text-xs text-bayu-textMuted">Equivalent of 5,300 cars off the road for one year</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">Target 2028</div>
                  <div className="font-display text-lg font-bold text-bayu-text">30,000 t</div>
                </div>
              </div>
              <div className="mt-4">
                <Sparkline data={CARBON_TREND} width={720} height={120} color="#10B981" strokeWidth={2.5} fill />
                <div className="mt-2 flex justify-between text-[10px] text-bayu-textDim">
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>
          </Section>

          {/* Protected areas + eco operators */}
          <div className="grid grid-cols-12 gap-6">
            <Section
              className="col-span-12 lg:col-span-6"
              title="Protected areas"
              subtitle="Marine + terrestrial conservation footprint"
              kicker="13% of state area"
            >
              <div className="space-y-2">
                {[
                  { name: 'Tunku Abdul Rahman Marine Park', area: '49 km²', status: 'active', icon: Waves },
                  { name: 'Sipadan Island Park', area: '16 km²', status: 'active · capacity-limited', icon: Waves },
                  { name: 'Crocker Range National Park', area: '1,399 km²', status: 'active', icon: TreePine },
                  { name: 'Kinabalu National Park (UNESCO)', area: '754 km²', status: 'active', icon: TreePine },
                  { name: 'Danum Valley Conservation Area', area: '438 km²', status: 'active', icon: TreePine },
                  { name: 'Lower Kinabatangan Wildlife Sanctuary', area: '270 km²', status: 'active', icon: TreePine },
                  { name: 'Tawau Hills Park', area: '279 km²', status: 'active', icon: TreePine },
                  { name: 'Turtle Islands Park', area: '17 km²', status: 'active · permit-required', icon: Waves },
                ].map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <motion.div
                      key={p.name}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="flex items-center gap-3 rounded-lg border border-bayu-line bg-bayu-bg2/40 px-3 py-2"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bayu-jungle/20">
                        <Icon className="h-4 w-4 text-bayu-jungle" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-semibold text-bayu-text">{p.name}</div>
                        <div className="truncate text-[10px] text-bayu-textDim">{p.status}</div>
                      </div>
                      <div className="font-mono text-xs tabular-nums text-bayu-textMuted">{p.area}</div>
                    </motion.div>
                  );
                })}
              </div>
            </Section>

            <Section
              className="col-span-12 lg:col-span-6"
              title="Eco-certified operators"
              subtitle={`${stats.sustainability.ecoCertifiedOperators}% of licensed operators hold a sustainability badge`}
            >
              <div className="space-y-3">
                {[
                  { scheme: 'Green Globe certified', count: 42, share: 12 },
                  { scheme: 'EarthCheck certified', count: 36, share: 11 },
                  { scheme: 'MSTQ (Malaysia Sustainable Tourism)', count: 128, share: 37 },
                  { scheme: 'Carbon-neutral declared', count: 48, share: 14 },
                  { scheme: 'In-progress audit', count: 26, share:  8 },
                  { scheme: 'Non-certified', count: 62, share: 18 },
                ].map((s, i) => (
                  <motion.div
                    key={s.scheme}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Award className="h-3 w-3 text-bayu-gold" />
                        <span className="text-bayu-text">{s.scheme}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums text-bayu-textMuted">{s.count}</span>
                        <span className="text-bayu-textDim">· {s.share}%</span>
                      </div>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bayu-bg2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.share * 2.7}%` }}
                        transition={{ delay: 0.2 + i * 0.04, duration: 0.6 }}
                        className="h-full rounded-full bg-gradient-to-r from-bayu-jungle to-bayu-sky"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </Section>
          </div>

          {/* Signature initiatives */}
          <Section title="Signature initiatives" subtitle="Flagship programs driving the score">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Sparkles, title: 'Plastic-free Islands Charter', desc: '12 islands fully onboarded. TARP achieved zero-plastic operational status in Q1 2026.', tag: 'Environmental' },
                { icon: Leaf, title: 'Reforestation Fund', desc: 'RM 1 levied on every arrival → planted 147K trees in degraded Kinabatangan riverbanks.', tag: 'Environmental' },
                { icon: Users2, title: 'Homestay Network', desc: '840 Indigenous homestays across Tambunan, Kiulu, Kudat. 28% of bookings revenue stays local.', tag: 'Social' },
                { icon: Cloud, title: 'Reef Watch', desc: 'Live coral bleaching monitoring at 8 dive sites with dive-operator-sourced data.', tag: 'Environmental' },
                { icon: Trash2, title: 'Operator Waste Audit', desc: 'Quarterly audits of 340 operators. 43% state-wide waste reduction achieved vs. 2023 baseline.', tag: 'Governance' },
                { icon: Award, title: 'Sabah Sustainable Tourism Award', desc: 'Annual recognition of 20 operators. Alumni see avg 24% increase in premium bookings.', tag: 'Governance' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.title}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl border border-bayu-line bg-bayu-bg1 p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bayu-jungle/20">
                        <Icon className="h-5 w-5 text-bayu-jungle" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
                        {s.tag}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-base font-bold text-bayu-text">{s.title}</h3>
                    <p className="mt-1 text-xs text-bayu-textMuted leading-relaxed">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

function Pillar({ icon: Icon, label, score, color }: { icon: any; label: string; score: number; color: string }) {
  return (
    <div className="rounded-lg border border-bayu-line bg-bayu-bg2/40 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textMuted">
          {label}
        </span>
      </div>
      <div className="mt-2 font-display text-3xl font-bold tabular-nums" style={{ color }}>
        {score}
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-bayu-bg2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
