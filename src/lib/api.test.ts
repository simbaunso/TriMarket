import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchPolymarket } from './api';
import {
  POLYMARKET_COLLATERAL_CURRENCY,
  POLYMARKET_PROXY_ENDPOINTS,
  REAL_TRADING_ENABLED,
  isRealTradingEnabled,
} from './polymarket';
import type { PolymarketEvent } from '@/types/market';

const sampleEvent: PolymarketEvent = {
  title: 'Will TriMarket ship v2?',
  description: 'Release check',
  slug: 'trimarket-v2',
  image: 'https://example.com/image.png',
  tags: [{ label: 'Tech' }],
  createdAt: '2026-05-30T00:00:00Z',
  markets: [
    {
      id: 'market-1',
      question: 'Will TriMarket ship v2?',
      outcomePrices: '["0.62","0.38"]',
      volume: '1000',
      volume24hr: 125,
      liquidity: '400',
      endDate: '2026-06-30T00:00:00Z',
      active: true,
      closed: false,
      clobTokenIds: '["yes-token","no-token"]',
      conditionId: 'condition-1',
    },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('fetchPolymarket', () => {
  it('loads Gamma markets through the v2 proxy and marks pUSD collateral', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [sampleEvent],
    } as Response);

    const markets = await fetchPolymarket(1);

    expect(fetchMock).toHaveBeenCalledWith(
      `${POLYMARKET_PROXY_ENDPOINTS.gamma}/events?limit=1&active=true&closed=false&order=volume&ascending=false`,
    );
    expect(markets).toHaveLength(1);
    expect(markets[0]).toMatchObject({
      id: 'poly_market-1',
      platform: 'polymarket',
      question: 'Will TriMarket ship v2?',
      collateralCurrency: POLYMARKET_COLLATERAL_CURRENCY,
    });
    expect(markets[0].outcomes[0].price).toBe(0.62);
  });

  it('keeps real trading guarded off', () => {
    expect(REAL_TRADING_ENABLED).toBe(false);
    expect(isRealTradingEnabled()).toBe(false);
  });
});
