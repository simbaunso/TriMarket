'use client';

import type { ThemeMode } from '@/types/market';

const THEMES: { key: ThemeMode; label: string }[] = [
  { key: 'dark-concrete', label: 'DARK' },
  { key: 'light-raw', label: 'LIGHT' },
  { key: 'crt-scanline', label: 'CRT' },
];

export default function ThemeToggle({
  theme,
  onChange,
}: {
  theme: ThemeMode;
  onChange: (t: ThemeMode) => void;
}) {
  return (
    <div className="flex" style={{ border: '2px solid var(--border-color)' }}>
      {THEMES.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className="px-2 py-1 text-[9px] font-black tracking-wider cursor-pointer transition-all brutal-press"
          style={{
            background: theme === t.key ? 'var(--accent)' : 'transparent',
            color: theme === t.key ? '#000' : 'inherit',
            borderRight: '1px solid var(--border-color)',
            boxShadow: theme === t.key ? '3px 3px 0 #000' : 'none',
            transform: theme === t.key ? 'translate(-1px, -1px)' : 'none',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
