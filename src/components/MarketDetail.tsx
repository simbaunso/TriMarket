'use client';

import { motion } from 'framer-motion';
import type { Market } from '@/types/market';
import { formatVolume } from '@/lib/api';

const PLATFORM_COLORS = {
  polymarket: '#3B82F6',
  kalshi: '#8B5CF6',
  opinion: '#EAB308',
};

export default function MarketDetail({
  market,
  onClose,
}: {
  market: Market;
  onClose: () => void;
}) {
  const yesPrice = market.outcomes[0]?.price ?? 0.5;
  const noPrice = market.outcomes[1]?.price ?? 0.5;
  const color = PLATFORM_COLORS[market.platform];

  const timeLeft = market.endDate
    ? (() => {
        const diff = new Date(market.endDate).getTime() - Date.now();
        if (diff <= 0) return 'ENDED';
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        if (days > 0) return `${days}D ${hours}H LEFT`;
        return `${hours}H LEFT`;
      })()
    : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <motion.div
        className="relative w-full max-w-lg overflow-hidden"
        style={{
          background: 'var(--card-bg)',
          border: `3px solid ${color}`,
          boxShadow: `12px 12px 0 ${color}`,
        }}
        initial={{ scale: 0.85, y: 60 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 60 }}
        transition={{ type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.15 }}
      >
        {/* Header */}
        <div className="p-4 border-b-3" style={{ borderColor: `${color}40`, background: `${color}08` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2 py-0.5 text-[10px] font-black tracking-widest text-black"
                  style={{ background: color }}
                >
                  {market.platform.toUpperCase()}
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                  {market.category}
                </span>
                {timeLeft && (
                  <span className="text-[9px] font-black uppercase tracking-wider opacity-40 ml-auto">
                    {timeLeft}
                  </span>
                )}
              </div>
              <h2 className="text-base font-black uppercase leading-tight tracking-tight" style={{ fontFamily: 'var(--font-mono)' }}>
                {market.question}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 font-black text-sm flex items-center justify-center flex-shrink-0 cursor-pointer transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] brutal-press"
              style={{
                border: '2px solid #EF4444',
                background: '#EF4444',
                color: '#000',
                boxShadow: '3px 3px 0 #000',
              }}
            >
              X
            </button>
          </div>
        </div>

        {/* Probability Display */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className="p-4 relative overflow-hidden"
              style={{ border: `2px solid ${color}40`, background: `${color}08` }}
            >
              <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">
                {market.outcomes[0]?.name || 'Yes'}
              </div>
              <div className="text-4xl font-black tabular-nums leading-none" style={{ color }}>
                {Math.round(yesPrice * 100)}
                <span className="text-lg opacity-50">%</span>
              </div>
            </div>
            <div
              className="p-4"
              style={{ border: '2px solid var(--border-color)' }}
            >
              <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">
                {market.outcomes[1]?.name || 'No'}
              </div>
              <div className="text-4xl font-black tabular-nums leading-none opacity-40">
                {Math.round(noPrice * 100)}
                <span className="text-lg opacity-50">%</span>
              </div>
            </div>
          </div>

          {/* Full bar */}
          <div
            className="relative h-8 bg-black/30 mb-4"
            style={{ border: `2px solid ${color}30` }}
          >
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ background: color }}
              animate={{ width: `${Math.round(yesPrice * 100)}%` }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white mix-blend-difference tabular-nums tracking-wider">
              {Math.round(yesPrice * 100)}% — {Math.round(noPrice * 100)}%
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'VOLUME', value: formatVolume(market.volume) },
              { label: '24H VOL', value: market.volume24h ? formatVolume(market.volume24h) : '—' },
              { label: 'LIQUIDITY', value: market.liquidity ? formatVolume(market.liquidity) : '—' },
            ].map(s => (
              <div key={s.label} className="p-2 text-center" style={{ border: '1px solid var(--border-color)' }}>
                <div className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">{s.label}</div>
                <div className="text-sm font-black tabular-nums">{s.value}</div>
              </div>
            ))}
          </div>

          {market.description && (
            <div className="p-3 mb-4" style={{ border: '1px solid var(--border-color)', background: 'var(--bg)' }}>
              <div className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">RESOLUTION</div>
              <p className="text-[11px] leading-relaxed opacity-60 line-clamp-4">
                {market.description}
              </p>
            </div>
          )}

          <a
            href={market.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2.5 font-black text-[11px] uppercase tracking-[0.2em] cursor-pointer transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] brutal-press"
            style={{
              border: `3px solid ${color}`,
              color,
              boxShadow: `4px 4px 0 ${color}`,
            }}
          >
            VIEW ON {market.platform.toUpperCase()} →
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
