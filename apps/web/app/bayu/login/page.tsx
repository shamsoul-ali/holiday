'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Waves, KeyRound, Building2 } from 'lucide-react';

export default function BayuLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleEnter(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setTimeout(() => router.push('/bayu'), 420);
  }

  return (
    <div className="min-h-screen bg-bayu-bg0 relative overflow-hidden flex items-center justify-center p-6">
      {/* Background aurora */}
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-bayu-ocean/30 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 h-[480px] w-[480px] rounded-full bg-bayu-gold/20 blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-bayu-sky/10 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(46, 175, 232, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(46, 175, 232, 0.4) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[440px]"
      >
        {/* Logo / brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-bayu-ocean to-bayu-sky shadow-lg shadow-bayu-ocean/40">
            <Waves className="h-6 w-6 text-white" strokeWidth={2.5} />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-bayu-gold ring-2 ring-bayu-bg0" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-bayu-textMuted">
              Bayu · Sabah Tourism
            </div>
            <div className="font-display text-xl font-bold text-bayu-text">Command Center</div>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-bayu-line bg-bayu-bg1/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 flex items-center gap-2">
            <Shield className="h-4 w-4 text-bayu-sky" />
            <span className="text-xs font-semibold uppercase tracking-wider text-bayu-sky">
              Authorized Personnel Only
            </span>
          </div>

          <h1 className="font-display text-3xl font-bold text-bayu-text">Sign in</h1>
          <p className="mt-2 text-sm text-bayu-textMuted">
            Sabah State Ministry of Tourism, Culture and Environment.
          </p>

          <form onSubmit={handleEnter} className="mt-6 space-y-4">
            <Field label="Official email" icon={<Building2 className="h-4 w-4" />} placeholder="officer@sabahtourism.gov.my" defaultValue="datuk.ahmad@sabahtourism.gov.my" />
            <Field label="Passcode" icon={<KeyRound className="h-4 w-4" />} type="password" placeholder="••••••••" defaultValue="bayu-demo-2026" />

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-bayu-textMuted">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-bayu-line bg-bayu-bg2 accent-bayu-sky" />
                Remember me on this device
              </label>
              <a href="#" className="text-xs font-semibold text-bayu-sky hover:text-bayu-skylight">
                Forgot?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-bayu-ocean to-bayu-sky py-3 text-sm font-semibold text-white shadow-lg shadow-bayu-ocean/40 transition hover:shadow-bayu-ocean/60"
            >
              <span className="relative z-10">
                {loading ? 'Authenticating…' : 'Enter Command Center'}
              </span>
              <svg
                className={`relative z-10 h-4 w-4 transition ${loading ? 'animate-spin' : 'group-hover:translate-x-0.5'}`}
                viewBox="0 0 24 24"
                fill="none"
              >
                {loading ? (
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 3a9 9 0 1 0 9 9" />
                ) : (
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M5 12h14m-5-5 5 5-5 5" />
                )}
              </svg>
            </button>
          </form>

          <div className="mt-6 border-t border-bayu-line pt-4 text-[11px] leading-relaxed text-bayu-textDim">
            Access to this platform is monitored and logged under the Official Secrets Act 1972.
            All data viewed here is classified for internal ministry use only.
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-[11px] text-bayu-textDim">
          <span>© 2026 Sabah Tourism Board · Powered by Bayu AI</span>
          <Link href="/" className="hover:text-bayu-sky">Back to Bayu app</Link>
        </div>
      </motion.div>
    </div>
  );
}

function Field({
  label,
  icon,
  type = 'text',
  placeholder,
  defaultValue,
}: {
  label: string;
  icon: React.ReactNode;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-bayu-textMuted">{label}</span>
      <div className="group relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-bayu-textDim transition group-focus-within:text-bayu-sky">
          {icon}
        </span>
        <input
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="w-full rounded-xl border border-bayu-line bg-bayu-bg2/60 py-2.5 pl-10 pr-3 text-sm text-bayu-text placeholder-bayu-textDim outline-none transition focus:border-bayu-sky focus:ring-2 focus:ring-bayu-sky/30"
        />
      </div>
    </label>
  );
}
