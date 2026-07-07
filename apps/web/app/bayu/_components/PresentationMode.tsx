'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minimize2, Keyboard } from 'lucide-react';

interface PresentationCtx {
  presenting: boolean;
  toggle: () => void;
}

const Ctx = createContext<PresentationCtx>({ presenting: false, toggle: () => {} });

export function usePresentation() {
  return useContext(Ctx);
}

/**
 * Client wrapper placed in the dashboard layout. When presenting === true,
 * the layout hides sidebar + padding, making the main content feel full-screen.
 * Press F to enter, Esc to exit.
 */
export function PresentationMode({ children }: { children: ReactNode }) {
  const [presenting, setPresenting] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const toggle = () => setPresenting((p) => !p);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ignore typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || (e.target as HTMLElement)?.isContentEditable) return;

      if ((e.key === 'f' || e.key === 'F') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setPresenting((p) => !p);
      } else if (e.key === 'Escape' && presenting) {
        setPresenting(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [presenting]);

  return (
    <Ctx.Provider value={{ presenting, toggle }}>
      {children}

      {/* Hint toast (visible for a few seconds on initial load) */}
      <AnimatePresence>
        {showHint && !presenting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="pointer-events-none fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-bayu-line bg-bayu-bg1/90 px-4 py-2 shadow-2xl backdrop-blur"
          >
            <Keyboard className="h-3.5 w-3.5 text-bayu-sky" />
            <span className="text-xs text-bayu-textMuted">Press</span>
            <kbd className="flex h-5 items-center rounded border border-bayu-line bg-bayu-bg2 px-1.5 text-[10px] font-semibold text-bayu-text">
              F
            </kbd>
            <span className="text-xs text-bayu-textMuted">for presentation mode</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Presenting overlay */}
      <AnimatePresence>
        {presenting && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed left-0 right-0 top-0 z-[60] flex items-center justify-between border-b border-bayu-line bg-gradient-to-r from-bayu-bg0 via-bayu-bg1 to-bayu-bg0 px-8 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-bayu-ocean to-bayu-sky">
                  <span className="text-white">🌊</span>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-bayu-gold">
                    Presentation mode · confidential
                  </div>
                  <div className="font-display text-sm font-bold text-bayu-text">
                    Sabah Tourism Command Center
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-md border border-bayu-line bg-bayu-bg2/50 px-2 py-1 text-[10px] text-bayu-textMuted">
                  <span className="h-1.5 w-1.5 rounded-full bg-bayu-coral animate-pulse" />
                  LIVE DATA
                </span>
                <button
                  onClick={toggle}
                  className="flex items-center gap-1.5 rounded-md border border-bayu-line bg-bayu-bg1 px-2.5 py-1.5 text-xs font-semibold text-bayu-textMuted transition hover:border-bayu-sky hover:text-bayu-text"
                >
                  <Minimize2 className="h-3 w-3" />
                  Exit
                  <kbd className="ml-1 rounded border border-bayu-line bg-bayu-bg2 px-1 text-[9px]">
                    Esc
                  </kbd>
                </button>
              </div>
            </motion.div>

            {/* CSS injection to hide sidebar and pad content for presenting mode */}
            <style>{`
              body { overflow: hidden; }
              .bayu-sidebar { display: none !important; }
              .bayu-topbar  { display: none !important; }
              .bayu-main    { padding-top: 56px !important; }
            `}</style>
          </>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
