'use client';

import { motion } from 'framer-motion';
import type { Platform, FetchResult } from '@/types/market';

const PLATFORM_STATUS: Record<Platform, { color: string; label: string }> = {
  polymarket: { color: '#3B82F6', label: 'POLYMARKET' },
  kalshi: { color: '#8B5CF6', label: 'KALSHI' },
  opinion: { color: '#EAB308', label: 'OPINION' },
};

export default function StatusBar({
  errors,
  lastUpdate,
  marketCount,
  loading,
}: {
  errors: FetchResult['errors'];
  lastUpdate: number;
  marketCount: number;
  loading: boolean;
}) {
  const errorPlatforms = new Set(errors.map(e => e.platform));
  const ago = lastUpdate ? Math.round((Date.now() - lastUpdate) / 1000) : null;

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em]"
      style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg)' }}
    >
      <div className="flex items-center gap-4">
        {(Object.keys(PLATFORM_STATUS) as Platform[]).map(p => {
          const info = PLATFORM_STATUS[p];
          const hasError = errorPlatforms.has(p);
          return (
            <div key={p} className="flex items-center gap-1.5">
              <motion.div
                className="w-2 h-2"
                style={{ background: hasError ? '#EF4444' : info.color }}
                animate={hasError ? {} : { opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className={hasError ? 'opacity-30 line-through' : 'opacity-60'}>
                {info.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 opacity-50">
        {loading ? (
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            SYNCING...
          </motion.span>
        ) : (
          <>
            <span>{marketCount} MARKETS</span>
            {ago !== null && <span>UPDATED {ago}s AGO</span>}
          </>
        )}
      </div>
    </div>
  );
}
