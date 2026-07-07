'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Heart, TrendingUp, MessageCircle, Sparkles } from 'lucide-react';
import { stats } from '../_data/stats';

const platformIcons: Record<string, string> = {
  TikTok: '🎵',
  Instagram: '📷',
  YouTube: '▶',
  Xiaohongshu: '📕',
  Twitter: '𝕏',
};

export function SocialSentiment() {
  const s = stats.social;
  const [postIdx, setPostIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPostIdx((i) => (i + 1) % s.topPosts.length), 4000);
    return () => clearInterval(id);
  }, [s.topPosts.length]);

  const currentPost = s.topPosts[postIdx];

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sentiment gauge */}
      <div className="col-span-12 md:col-span-4">
        <div className="mb-3 flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-bayu-coral" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
            Sentiment
          </h3>
        </div>

        <div className="mb-4 flex items-baseline gap-2">
          <span className="font-display text-4xl font-bold text-bayu-jungle">
            {s.sentiment.positive}%
          </span>
          <span className="text-xs text-bayu-textMuted">positive</span>
        </div>

        <div className="mb-4 flex h-2 overflow-hidden rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${s.sentiment.positive}%` }}
            transition={{ duration: 1 }}
            className="bg-bayu-jungle"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${s.sentiment.neutral}%` }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-bayu-textDim"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${s.sentiment.negative}%` }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-bayu-coral"
          />
        </div>

        <div className="space-y-1.5 text-xs">
          <SentimentRow label="Positive" pct={s.sentiment.positive} color="#10B981" />
          <SentimentRow label="Neutral"  pct={s.sentiment.neutral}  color="#5A7394" />
          <SentimentRow label="Negative" pct={s.sentiment.negative} color="#F5362F" />
        </div>

        <div className="mt-4 rounded-lg border border-bayu-line bg-bayu-bg2/50 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
            Total mentions (30d)
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-display text-xl font-bold text-bayu-text">
              {(s.totalMentions / 1000).toFixed(1)}K
            </span>
            <span className="inline-flex items-center gap-0.5 rounded bg-bayu-jungle/15 px-1.5 py-0.5 text-[10px] font-bold text-bayu-jungle">
              <TrendingUp className="h-3 w-3" />+{s.mentionsYoY}%
            </span>
          </div>
        </div>
      </div>

      {/* Trending hashtags */}
      <div className="col-span-12 md:col-span-4 md:border-l md:border-bayu-line md:pl-6">
        <div className="mb-3 flex items-center gap-2">
          <Hash className="h-3.5 w-3.5 text-bayu-sky" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
            Trending hashtags
          </h3>
        </div>
        <div className="space-y-2">
          {s.hashtags.map((h, i) => (
            <motion.div
              key={h.tag}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group flex items-center gap-3 rounded-lg bg-bayu-bg2/40 px-3 py-2 transition hover:bg-bayu-bg2/70"
            >
              <span className="font-display text-xs font-bold tabular-nums text-bayu-textDim">
                {(i + 1).toString().padStart(2, '0')}
              </span>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold text-bayu-sky">{h.tag}</div>
                <div className="text-[10px] text-bayu-textDim">
                  {(h.mentions / 1000).toFixed(1)}K mentions
                </div>
              </div>
              <span className="inline-flex items-center gap-0.5 rounded bg-bayu-jungle/15 px-1.5 py-0.5 text-[10px] font-bold text-bayu-jungle">
                <TrendingUp className="h-3 w-3" />+{h.trend.toFixed(0)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Influencers + rotating top post */}
      <div className="col-span-12 md:col-span-4 md:border-l md:border-bayu-line md:pl-6">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-bayu-gold" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-bayu-textMuted">
            Top influencers
          </h3>
        </div>

        <div className="space-y-2">
          {s.influencers.slice(0, 3).map((inf, i) => (
            <motion.div
              key={inf.handle}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-lg bg-bayu-bg2/40 px-3 py-2"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-bayu-gold to-bayu-goldlight text-sm">
                {platformIcons[inf.platform] ?? '•'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-bayu-text">{inf.name}</div>
                <div className="truncate text-[10px] text-bayu-textDim">
                  {inf.handle} · {inf.region}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-xs font-bold text-bayu-text tabular-nums">
                  {(inf.reach / 1_000_000).toFixed(1)}M
                </div>
                <div className="text-[9px] text-bayu-textDim">{inf.engagement}% eng.</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative mt-4 min-h-[86px] overflow-hidden rounded-lg border border-bayu-line bg-bayu-bg2/60 p-3">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-bayu-textDim">
            <MessageCircle className="h-3 w-3" />
            <span>Featured post</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={postIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-xs text-bayu-text leading-snug">"{currentPost.text}"</p>
              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-bayu-textDim">
                <span className="font-semibold text-bayu-sky">{currentPost.platform}</span>
                <span>·</span>
                <span>{(currentPost.likes / 1000).toFixed(0)}K likes</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SentimentRow({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-bayu-textMuted">{label}</span>
      </div>
      <span className="font-display font-bold text-bayu-text tabular-nums">{pct}%</span>
    </div>
  );
}
