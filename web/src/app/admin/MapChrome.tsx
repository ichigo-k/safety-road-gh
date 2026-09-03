'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/* ─── Map chrome visibility ────────────────────────────────────────────────
 *
 * Show/hide every floating panel over the command map in one click.
 *
 * The overlays are useful right up until you actually need to read the map —
 * at which point four cards and a legend are covering the roads you are
 * trying to look at.
 *
 * Why a context rather than a wrapper: the KPI strip, report list and legend
 * are server-rendered (they need database data), while the layer toggles live
 * inside CommandMap's own client state. They are siblings, so a component
 * that simply wrapped its children could only ever hide one of the two.
 * ------------------------------------------------------------------------ */

const MapChromeContext = createContext(true);

/** True when the floating panels should be shown. */
export const useMapChromeVisible = () => useContext(MapChromeContext);

export function MapChromeProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);

  // Escape restores the panels — a way back that does not depend on finding
  // the button again on a map you have since panned elsewhere.
  useEffect(() => {
    if (visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  return (
    <MapChromeContext.Provider value={visible}>
      {children}

      {/* Deliberately outside the hidden region and in a corner nothing else
          occupies: hiding the control that un-hides everything is a trap. */}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={!visible}
        aria-label={visible ? 'Hide map panels' : 'Show map panels'}
        title={visible ? 'Hide panels' : 'Show panels (Esc)'}
        className="absolute bottom-4 right-4 z-[500] inline-flex h-10 items-center gap-2 rounded-sm bg-surface px-3 text-caption font-semibold text-ink-700 shadow-float transition-colors hover:bg-ink-50 md:bottom-6 md:right-6"
      >
        {visible ? (
          <>
            <EyeOff className="h-4 w-4" strokeWidth={2.2} />
            <span className="hidden sm:inline">Hide panels</span>
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" strokeWidth={2.2} />
            <span className="hidden sm:inline">Show panels</span>
          </>
        )}
      </button>
    </MapChromeContext.Provider>
  );
}

/** Wraps anything that should disappear when panels are hidden. */
export function MapPanel({ children }: { children: React.ReactNode }) {
  return useMapChromeVisible() ? <>{children}</> : null;
}
