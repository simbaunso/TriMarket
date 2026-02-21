'use client';

import type { CategoryFilter, Market } from '@/types/market';

const CATEGORIES: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'politics', label: 'POLITICS' },
  { key: 'crypto', label: 'CRYPTO' },
  { key: 'macro', label: 'MACRO' },
  { key: 'sports', label: 'SPORTS' },
  { key: 'geopolitics', label: 'GEO' },
  { key: 'tech', label: 'TECH' },
  { key: 'culture', label: 'CULTURE' },
];

export default function CategoryBar({
  active,
  onChange,
  markets,
}: {
  active: CategoryFilter;
  onChange: (c: CategoryFilter) => void;
  markets: Market[];
}) {
  function count(cat: CategoryFilter) {
    if (cat === 'all') return markets.length;
    return markets.filter(m => m.category === cat).length;
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      {CATEGORIES.map(c => {
        const n = count(c.key);
        const isActive = active === c.key;
        if (c.key !== 'all' && n === 0) return null;
        return (
          <button
            key={c.key}
            onClick={() => onChange(c.key)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap cursor-pointer transition-all brutal-press"
            style={{
              border: isActive ? '3px solid var(--accent)' : '2px solid var(--border-color)',
              background: isActive ? 'var(--accent)' : 'transparent',
              color: isActive ? '#000' : 'inherit',
              boxShadow: isActive ? '4px 4px 0 #000' : 'none',
              transform: isActive ? 'translate(-2px, -2px)' : 'none',
            }}
          >
            <span>{c.label}</span>
            {n > 0 && (
              <span className={isActive ? 'opacity-60' : 'opacity-30'}>({n})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
