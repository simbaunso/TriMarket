'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Market, Platform, FetchResult, CategoryFilter } from '@/types/market';
import { fetchAllMarkets } from '@/lib/api';

export function useMarkets(
  refreshInterval = 8000,
  platforms: Platform[] = ['polymarket', 'kalshi', 'opinion']
) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [errors, setErrors] = useState<FetchResult['errors']>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const prevMarketsRef = useRef<Map<string, Market>>(new Map());

  const refresh = useCallback(async () => {
    try {
      const result = await fetchAllMarkets(40, platforms);

      // Track previous values for shockwave detection
      const prevMap = prevMarketsRef.current;
      const enhanced = result.markets.map(m => {
        const prev = prevMap.get(m.id);
        if (prev) {
          const priceDelta = Math.abs(m.outcomes[0].price - prev.outcomes[0].price);
          if (priceDelta > 0.02) {
            return { ...m, shockwaveStrength: Math.min(priceDelta * 10, 1) };
          }
        }
        return m;
      });

      // Update previous map
      const newMap = new Map<string, Market>();
      enhanced.forEach(m => newMap.set(m.id, m));
      prevMarketsRef.current = newMap;

      setMarkets(enhanced);
      setErrors(result.errors);
      setLastUpdate(result.timestamp);
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  }, [platforms]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  const filtered = category === 'all'
    ? markets
    : markets.filter(m => m.category === category);

  return {
    markets: filtered,
    allMarkets: markets,
    errors,
    loading,
    lastUpdate,
    category,
    setCategory,
    refresh,
  };
}
