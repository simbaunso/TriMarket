'use client';

import { useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { ThemeMode, Market, Platform } from '@/types/market';
import { useMarkets } from '@/hooks/useMarkets';
import PulseCard from './PulseCard';
import MarketDetail from './MarketDetail';
import CategoryBar from './CategoryBar';
import StatusBar from './StatusBar';
import ThemeToggle from './ThemeToggle';
import PulseBackground from './PulseBackground';
import ScanlineOverlay from './ScanlineOverlay';

export default function PulseWall() {
  const {
    markets,
    allMarkets,
    errors,
    loading,
    lastUpdate,
    category,
    setCategory,
    refresh,
  } = useMarkets(60000);

  const [theme, setTheme] = useState<ThemeMode>('dark-concrete');
  const [selected, setSelected] = useState<Market | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlatforms, setActivePlatforms] = useState<Set<Platform>>(new Set(['polymarket', 'kalshi', 'opinion']));

  const togglePlatform = (p: Platform) => {
    setActivePlatforms(prev => {
      const next = new Set(prev);
      if (next.has(p)) {
        if (next.size > 1) next.delete(p); // Keep at least 1 active
      } else {
        next.add(p);
      }
      return next;
    });
  };

  const themeClass = theme === 'dark-concrete'
    ? 'theme-dark'
    : theme === 'light-raw'
      ? 'theme-light'
      : 'theme-crt';

  const avgIntensity = useMemo(() => {
    if (!markets.length) return 0.3;
    return markets.reduce((s, m) => s + m.pulseIntensity, 0) / markets.length;
  }, [markets]);

  const filtered = useMemo(() => {
    let result = markets.filter(m => activePlatforms.has(m.platform));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m =>
        m.question.toLowerCase().includes(q) ||
        m.category.includes(q) ||
        m.platform.includes(q)
      );
    }
    return result;
  }, [markets, searchQuery, activePlatforms]);

  const platformCounts = useMemo(() => {
    const counts = { polymarket: 0, kalshi: 0, opinion: 0 };
    allMarkets.forEach(m => counts[m.platform]++);
    return counts;
  }, [allMarkets]);

  // Determine featured markets (top by volume)
  const featuredThreshold = useMemo(() => {
    if (filtered.length < 8) return Infinity;
    const sorted = [...filtered].sort((a, b) => b.volume - a.volume);
    return sorted[Math.min(3, sorted.length - 1)]?.volume ?? Infinity;
  }, [filtered]);

  return (
    <div className={`min-h-screen ${themeClass}`} style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <PulseBackground intensity={avgIntensity} />
      <ScanlineOverlay enabled={theme === 'crt-scanline'} />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b-3 border-black/80 sticky top-0 z-30" style={{ background: 'var(--surface)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-black tracking-tighter uppercase flex items-center" style={{ fontFamily: 'var(--font-mono)' }}>
                <span className="inline-block w-4 h-4 mr-2" style={{ background: '#3B82F6' }} />
                TRIMARKET
              </h1>
              <span className="hidden md:block text-[8px] font-bold uppercase tracking-[0.3em] opacity-30">
                THREE MARKETS · ONE PULSE
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="SEARCH..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-32 md:w-44 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-transparent outline-none transition-colors"
                  style={{ border: '2px solid var(--border-color, rgba(255,255,255,0.12))' }}
                />
              </div>
              <ThemeToggle theme={theme} onChange={setTheme} />
              <button
                onClick={refresh}
                className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] cursor-pointer brutal-press"
                style={{
                  border: '3px solid var(--accent)',
                  boxShadow: '4px 4px 0 var(--accent)',
                  color: 'var(--accent)',
                }}
              >
                SYNC
              </button>
            </div>
          </div>

          <div className="px-4 pb-2">
            <CategoryBar active={category} onChange={setCategory} markets={allMarkets} />
          </div>
        </header>

        {/* Status bar */}
        <StatusBar
          errors={errors}
          lastUpdate={lastUpdate}
          marketCount={filtered.length}
          loading={loading}
        />

        {/* Platform filter */}
        <div className="flex items-center gap-2 px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] border-b border-white/5">
          <span className="opacity-30 mr-1">SOURCES:</span>
          {([
            { key: 'polymarket' as Platform, label: 'POLY', color: '#3B82F6', count: platformCounts.polymarket },
            { key: 'kalshi' as Platform, label: 'KALSHI', color: '#8B5CF6', count: platformCounts.kalshi },
            { key: 'opinion' as Platform, label: 'OPINION', color: '#EAB308', count: platformCounts.opinion },
          ]).map(p => {
            const isActive = activePlatforms.has(p.key);
            return (
              <button
                key={p.key}
                onClick={() => togglePlatform(p.key)}
                className="flex items-center gap-1.5 px-2 py-0.5 cursor-pointer transition-all brutal-press"
                style={{
                  border: `2px solid ${isActive ? p.color : 'var(--border-color)'}`,
                  background: isActive ? `${p.color}15` : 'transparent',
                  color: isActive ? p.color : 'var(--text)',
                  opacity: isActive ? 1 : 0.3,
                  boxShadow: isActive ? `3px 3px 0 ${p.color}` : 'none',
                  transform: isActive ? 'translate(-1px, -1px)' : 'none',
                }}
              >
                <span className="w-2 h-2" style={{ background: isActive ? p.color : 'var(--border-color)' }} />
                {p.label}({p.count})
              </button>
            );
          })}
        </div>

        {/* Market grid - dynamic layout */}
        <main className="p-4">
          {loading && !markets.length ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div
                className="w-12 h-12 border-4 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                SYNCING MARKET DATA...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <div className="w-8 h-8" style={{ background: 'var(--accent)', opacity: 0.3 }} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                NO MARKETS FOUND
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 auto-rows-[minmax(140px,auto)]">
              {filtered.map((market, i) => {
                const isFeatured = market.volume >= featuredThreshold;
                return (
                  <div
                    key={market.id}
                    className={isFeatured ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}
                  >
                    <PulseCard
                      market={market}
                      onClick={setSelected}
                      index={i}
                      isFeatured={isFeatured}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Error notices */}
        {errors.length > 0 && (
          <div className="fixed bottom-4 right-4 z-40 space-y-2">
            {errors.map((e, i) => (
              <div
                key={i}
                className="px-3 py-2 text-[10px] font-black uppercase tracking-wider"
                style={{
                  border: '2px solid #EF4444',
                  background: '#EF444415',
                  color: '#F87171',
                  boxShadow: '4px 4px 0 #EF4444',
                }}
              >
                {e.platform}: {e.error}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <MarketDetail
            market={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
