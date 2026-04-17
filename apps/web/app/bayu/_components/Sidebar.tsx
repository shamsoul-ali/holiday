'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe2,
  Users2,
  BarChart3,
  MapPin,
  Leaf,
  Zap,
  FileText,
  Settings,
  Waves,
  LogOut,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
  disabled?: boolean;
}

const PRIMARY: NavItem[] = [
  { href: '/bayu',                 label: 'Overview',        icon: LayoutDashboard },
  { href: '/bayu/origins',         label: 'Origin Map',      icon: Globe2 },
  { href: '/bayu/markets',         label: 'Source Markets',  icon: Users2, disabled: true },
  { href: '/bayu/revenue',         label: 'Revenue',         icon: BarChart3, disabled: true },
  { href: '/bayu/districts',       label: 'Districts',       icon: MapPin, disabled: true },
  { href: '/bayu/sustainability',  label: 'Sustainability',  icon: Leaf, disabled: true },
  { href: '/bayu/live-feed',       label: 'Live Feed',       icon: Zap, badge: 'LIVE' },
  { href: '/bayu/reports',         label: 'Reports',         icon: FileText },
  { href: '/bayu/sabah-map',       label: 'Sabah Map (debug)', icon: MapPin, badge: 'DEV' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] shrink-0 flex-col border-r border-bayu-line bg-bayu-bg1/90 backdrop-blur">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-bayu-ocean to-bayu-sky shadow-md shadow-bayu-ocean/40">
          <Waves className="h-5 w-5 text-white" strokeWidth={2.5} />
          <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-bayu-gold ring-2 ring-bayu-bg1" />
        </div>
        <div>
          <div className="font-display text-base font-bold leading-tight text-bayu-text">
            Bayu
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bayu-textDim">
            Command Center
          </div>
        </div>
      </div>

      {/* Authority bar */}
      <div className="mx-4 mb-4 rounded-lg border border-bayu-line bg-bayu-bg2/70 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-bayu-jungle shadow-[0_0_8px] shadow-bayu-jungle" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-bayu-textMuted">
            Ministry of Tourism
          </span>
        </div>
        <div className="mt-1 text-xs font-medium text-bayu-text">Sabah State Government</div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
        <SectionLabel>Tourism intelligence</SectionLabel>
        {PRIMARY.slice(0, 4).map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}
        <SectionLabel className="mt-4">Operations</SectionLabel>
        {PRIMARY.slice(4).map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} />
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-bayu-line p-3">
        <div className="flex items-center gap-3 rounded-lg bg-bayu-bg2/60 px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-bayu-gold to-bayu-goldlight text-sm font-bold text-bayu-bg0">
            DA
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-bayu-text">Datuk Ahmad</div>
            <div className="truncate text-[10px] text-bayu-textDim">Director-General</div>
          </div>
          <Link
            href="/bayu/login"
            title="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-md text-bayu-textDim transition hover:bg-bayu-line hover:text-bayu-text"
          >
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
        <button className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs text-bayu-textDim transition hover:text-bayu-text">
          <Settings className="h-3.5 w-3.5" />
          Settings
        </button>
      </div>
    </aside>
  );
}

function SectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-bayu-textDim ${className}`}>
      {children}
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  const base =
    'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition relative';
  const state = active
    ? 'bg-gradient-to-r from-bayu-ocean/25 to-transparent text-bayu-text font-semibold'
    : 'text-bayu-textMuted hover:bg-bayu-bg2/60 hover:text-bayu-text';

  const content = (
    <>
      {active && (
        <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-bayu-sky" />
      )}
      <Icon className={`h-4 w-4 ${active ? 'text-bayu-sky' : 'text-bayu-textDim group-hover:text-bayu-sky'}`} />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span className="flex items-center gap-1 rounded bg-bayu-coral/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-bayu-coral">
          <span className="h-1 w-1 rounded-full bg-bayu-coral animate-pulse" />
          {item.badge}
        </span>
      )}
      {item.disabled && (
        <span className="rounded bg-bayu-bg2 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-bayu-textDim">
          Soon
        </span>
      )}
    </>
  );

  if (item.disabled) {
    return (
      <div className={`${base} ${state} cursor-not-allowed opacity-70`}>{content}</div>
    );
  }
  return (
    <Link href={item.href} className={`${base} ${state}`}>
      {content}
    </Link>
  );
}
