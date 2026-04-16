import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bayu · Sabah Tourism Command Center',
  description: 'Real-time tourism intelligence for the Sabah State Government.',
};

// Root wrapper — no chrome here. The authenticated `(dashboard)` group adds the
// sidebar + topbar, while `/bayu/login` renders on a clean canvas.
export default function BayuRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bayu-bg0 font-sans text-bayu-text antialiased">
      {children}
    </div>
  );
}
