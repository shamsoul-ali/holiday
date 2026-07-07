'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Plane, Bell, Hash, TrendingUp, MapPin, Users } from 'lucide-react';
import { TopBar } from '../../_components/TopBar';
import { Section } from '../../_components/Section';
import { LiveDot, LiveCounter } from '../../_components/LiveCounter';
import { FlightBoard } from '../../_components/FlightBoard';
import { LiveBookingFeed } from '../../_components/LiveBookingFeed';
import { AlertsPanel } from '../../_components/AlertsPanel';
import { stats } from '../../_data/stats';

export default function LiveFeedPage() {
  return (
    <>
      <TopBar title="Live Operations Feed" />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1800px] space-y-6 p-6 lg:p-8">
          {/* Mission-control strip */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <BigMetric icon={Activity} label="Live arrivals today" value={<LiveCounter value={stats.liveVisitorsToday} ratePerSec={stats.liveVisitorsRate} />} accent="#F5362F" live />
            <BigMetric icon={Plane}    label="Inbound flights"     value={stats.incomingFlights.filter((f) => f.status !== 'landed').length.toString()}  accent="#2EAFE8" />
            <BigMetric icon={Bell}     label="Active alerts"       value={stats.alerts.filter((a) => a.severity === 'critical' || a.severity === 'warning').length.toString()}  accent="#F7B731" />
            <BigMetric icon={Hash}     label="Social mentions/hr" value="2.4K" accent="#A78BFA" />
            <BigMetric icon={Users}    label="Active tourists"     value="142,804" accent="#10B981" />
          </div>

          {/* 3-column wall */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left: flights + bookings */}
            <div className="col-span-12 xl:col-span-5 space-y-6">
              <Section
                title="BKI Arrivals Board"
                subtitle="Live ATC + MAVCOM feed"
                live
                kicker={`${stats.incomingFlights.length} today`}
              >
                <FlightBoard />
              </Section>

              <LiveBookingFeed />
            </div>

            {/* Center: alerts + social */}
            <div className="col-span-12 xl:col-span-4 space-y-6">
              <Section title="Active Incidents" subtitle="Safety · operations · weather" live>
                <AlertsPanel />
              </Section>

              <SocialFeed />
            </div>

            {/* Right: district pulse + trending */}
            <div className="col-span-12 xl:col-span-3 space-y-6">
              <Section title="District Pulse" subtitle="Live visitor density" live>
                <DistrictPulse />
              </Section>

              <Section title="Trending Now" subtitle="Hashtags surging">
                <TrendingList />
              </Section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function BigMetric({
  icon: Icon,
  label,
  value,
  accent,
  live,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
  accent: string;
  live?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-bayu-line bg-bayu-bg1 p-5">
      <div
        className="absolute left-0 top-0 h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      <div className="flex items-start justify-between">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: accent + '22' }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
        {live && <LiveDot size="xs" color="coral" />}
      </div>
      <div className="mt-3 font-display text-3xl font-bold text-bayu-text">{value}</div>
      <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-bayu-textDim">
        {label}
      </div>
    </div>
  );
}

// --- Social feed (rolling) ------------------------------------------------
function SocialFeed() {
  const posts = stats.social.topPosts.concat(stats.social.topPosts);
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % posts.length), 3800);
    return () => clearInterval(id);
  }, [posts.length]);

  return (
    <Section title="Social Intelligence" subtitle="Live mentions · top content" live>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, offset) => {
          const post = posts[(idx + offset) % posts.length];
          return (
            <AnimatePresence mode="wait" key={offset}>
              <motion.div
                key={`${idx}-${offset}`}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1 - offset * 0.2, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: offset * 0.08 }}
                className="rounded-lg border border-bayu-line bg-bayu-bg2/40 p-3"
              >
                <div className="mb-1 flex items-center gap-2 text-[10px] text-bayu-textDim">
                  <span className="rounded bg-bayu-sky/20 px-1.5 py-0.5 font-bold uppercase text-bayu-sky">
                    {post.platform}
                  </span>
                  <span className={post.sentiment === 'positive' ? 'text-bayu-jungle' : 'text-bayu-textMuted'}>
                    ● {post.sentiment}
                  </span>
                  <span className="ml-auto">{(post.likes / 1000).toFixed(0)}K ❤</span>
                </div>
                <p className="text-xs leading-snug text-bayu-text">"{post.text}"</p>
              </motion.div>
            </AnimatePresence>
          );
        })}
      </div>
    </Section>
  );
}

// --- District pulse --------------------------------------------------------
function DistrictPulse() {
  return (
    <div className="space-y-2">
      {stats.topDistricts.slice(0, 7).map((d, i) => (
        <motion.div
          key={d.name}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-2"
        >
          <MapPin className="h-3 w-3 text-bayu-sky" />
          <span className="text-xs font-medium text-bayu-text flex-1 truncate">{d.name}</span>
          <div className="relative h-6 w-6">
            <span
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: '#2EAFE8',
                opacity: 0.3,
                animation: `bayuPulse 1.6s ease-out ${i * 0.2}s infinite`,
              }}
            />
            <span
              className="absolute inset-[6px] rounded-full"
              style={{ backgroundColor: '#2EAFE8' }}
            />
          </div>
          <span className="font-display text-xs font-bold text-bayu-textMuted tabular-nums">
            {(d.visitors / 1000).toFixed(0)}K
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// --- Trending hashtags list -----------------------------------------------
function TrendingList() {
  return (
    <div className="space-y-2">
      {stats.social.hashtags.slice(0, 5).map((h, i) => (
        <motion.div
          key={h.tag}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-2 rounded-lg bg-bayu-bg2/40 px-2.5 py-1.5"
        >
          <span className="font-display text-xs font-bold tabular-nums text-bayu-textDim">
            {(i + 1).toString().padStart(2, '0')}
          </span>
          <span className="flex-1 truncate text-xs font-semibold text-bayu-sky">{h.tag}</span>
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-bayu-jungle">
            <TrendingUp className="h-3 w-3" />+{h.trend.toFixed(0)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
