'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Market } from '@/types/market';
import { formatVolume } from '@/lib/api';

const PLATFORM_COLORS = {
  polymarket: { bg: '#3B82F6', glow: '#60A5FA' },
  kalshi: { bg: '#8B5CF6', glow: '#A78BFA' },
  opinion: { bg: '#EAB308', glow: '#FACC15' },
};

const PLATFORM_LABELS = {
  polymarket: 'POLY',
  kalshi: 'KALSHI',
  opinion: 'OPINION',
};

export default function PulseCard({
  market,
  onClick,
  index,
  isFeatured = false,
}: {
  market: Market;
  onClick: (m: Market) => void;
  index: number;
  isFeatured?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const colors = PLATFORM_COLORS[market.platform];
  const yesPrice = market.outcomes[0]?.price ?? 0.5;
  const pct = Math.round(yesPrice * 100);

  const pulseDuration = Math.max(0.4, 2 - market.pulseIntensity * 1.6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.35, ease: 'easeOut' }}
      className="relative group cursor-pointer select-none h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(market)}
    >
      <div
        className={`relative overflow-hidden h-full transition-all duration-150 ${hovered ? 'z-20' : 'z-10'} brutal-press`}
        style={{
          background: hovered ? 'var(--card-hover)' : 'var(--card-bg)',
          border: `3px solid ${hovered ? colors.bg : 'var(--border-color, rgba(255,255,255,0.12))'}`,
          boxShadow: hovered
            ? `8px 8px 0 ${colors.bg}, inset 0 0 40px ${colors.bg}15`
            : '6px 6px 0 #000',
          transform: hovered ? 'translate(-3px, -3px)' : 'none',
        }}
      >
        {/* Platform badge */}
        <div
          className="absolute top-0 right-0 px-2.5 py-1 text-[10px] font-black tracking-widest z-10"
          style={{ background: colors.bg, color: '#000' }}
        >
          {PLATFORM_LABELS[market.platform]}
        </div>

        {/* Pulse indicator bar - left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: colors.bg }}>
          <motion.div
            className="absolute inset-0"
            style={{ background: colors.glow }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: pulseDuration,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
        </div>

        <div className={`${isFeatured ? 'p-5 pl-6' : 'p-3 pl-5'}`}>
          {/* Category tag */}
          <div
            className="inline-block px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.25em] mb-2 border"
            style={{
              borderColor: `${colors.bg}40`,
              color: colors.glow,
              background: `${colors.bg}10`,
            }}
          >
            {market.category}
          </div>

          {/* Question - brutalist typography */}
          <h3
            className={`font-black uppercase tracking-tighter mb-3 pr-14 ${
              isFeatured
                ? 'text-2xl md:text-3xl leading-[0.9] line-clamp-4'
                : 'text-xs leading-none line-clamp-2'
            }`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {market.question}
          </h3>

          {/* Big probability number for featured */}
          {isFeatured && (
            <div className="flex items-baseline gap-2 mb-3">
              <span
                className="text-5xl font-black tabular-nums leading-none"
                style={{ color: colors.bg }}
              >
                {pct}
              </span>
              <span className="text-lg font-black opacity-50">%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-40 ml-auto">
                {market.outcomes[0]?.name || 'YES'}
              </span>
            </div>
          )}

          {/* Probability Bar */}
          <div
            className={`relative ${isFeatured ? 'h-8' : 'h-6'} bg-black/30 mb-2`}
            style={{ border: `2px solid ${colors.bg}30` }}
          >
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{ background: colors.bg }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
            <div className="absolute inset-0 flex items-center justify-between px-2">
              {!isFeatured && (
                <span className="text-[9px] font-black text-white mix-blend-difference uppercase tracking-wider">
                  {market.outcomes[0]?.name || 'YES'}
                </span>
              )}
              <span
                className={`${isFeatured ? 'text-base' : 'text-sm'} font-black text-white mix-blend-difference tabular-nums ml-auto`}
              >
                {pct}%
              </span>
            </div>

            {/* Sweep glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none mix-blend-screen"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.glow}60, transparent)`,
              }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{
                duration: pulseDuration * 1.5,
                repeat: Infinity,
                ease: [0.76, 0, 0.24, 1],
              }}
            />
          </div>

          {/* Stats row */}
          <div className={`flex items-center justify-between ${isFeatured ? 'text-[10px]' : 'text-[9px]'} font-bold opacity-50`}>
            <span>VOL {formatVolume(market.volume)}</span>
            {market.volume24h ? (
              <span
                className="tabular-nums"
                style={{ color: market.shockwaveStrength > 0.3 ? colors.glow : 'inherit' }}
              >
                24H {formatVolume(market.volume24h)}
              </span>
            ) : null}
          </div>

          {/* Time remaining for featured */}
          {isFeatured && market.endDate && (
            <div className="mt-2 text-[9px] font-bold uppercase tracking-wider opacity-30">
              {(() => {
                const diff = new Date(market.endDate).getTime() - Date.now();
                if (diff <= 0) return 'ENDED';
                const days = Math.floor(diff / 86400000);
                return days > 0 ? `${days}D LEFT` : `${Math.floor(diff / 3600000)}H LEFT`;
              })()}
            </div>
          )}
        </div>

        {/* Shockwave overlay */}
        <AnimatePresence>
          {market.shockwaveStrength > 0.3 && (
            <motion.div
              className="absolute inset-0 pointer-events-none mix-blend-screen"
              initial={{ opacity: 0.6, scale: 0.5 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                background: `radial-gradient(circle, ${colors.bg}40, transparent 70%)`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Hover glow border effect */}
        {hovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              boxShadow: `inset 0 0 20px ${colors.bg}20`,
            }}
          />
        )}
      </div>
    </motion.div>
  );
}
