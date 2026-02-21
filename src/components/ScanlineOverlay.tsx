'use client';

export default function ScanlineOverlay({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden>
      {/* CRT Scanlines */}
      <div
        className="absolute inset-0"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      {/* Subtle flicker */}
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: 'rgba(0,255,100,0.01)',
          animationDuration: '0.1s',
        }}
      />
    </div>
  );
}
