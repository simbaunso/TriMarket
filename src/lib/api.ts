import type { Market, Platform, FetchResult } from '@/types/market';

// ─── Helpers ──────────────────────────────────────────────
function formatVolume(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}

function calcPulseIntensity(price: number): number {
  // Higher confidence (closer to 0 or 1) = higher pulse
  return Math.abs(price - 0.5) * 2;
}

function calcShockwave(volume24h: number, totalVolume: number): number {
  if (!totalVolume || !volume24h) return 0;
  const ratio = volume24h / totalVolume;
  return Math.min(ratio * 10, 1); // Normalize
}

function deriveCategory(tags: string[], title: string): string {
  const t = [...tags.map(t => t.toLowerCase()), title.toLowerCase()].join(' ');
  if (/politic|election|president|trump|biden|vote|congress|senate/.test(t)) return 'politics';
  if (/crypto|bitcoin|btc|eth|solana|defi|token|blockchain/.test(t)) return 'crypto';
  if (/sport|nba|nfl|soccer|football|tennis|ufc|match/.test(t)) return 'sports';
  if (/fed|rate|gdp|inflation|cpi|recession|economy|stock|s&p/.test(t)) return 'macro';
  if (/war|russia|china|iran|nato|geopolit|military|taiwan/.test(t)) return 'geopolitics';
  if (/ai|tech|apple|google|openai|spacex|tesla/.test(t)) return 'tech';
  return 'culture';
}

// ─── Polymarket ───────────────────────────────────────────
async function fetchPolymarket(limit = 30): Promise<Market[]> {
  const params = new URLSearchParams({
    endpoint: 'events',
    limit: String(limit),
    active: 'true',
    closed: 'false',
    order: 'volume',
    ascending: 'false',
  });

  const res = await fetch(`/api/polymarket?${params}`);
  if (!res.ok) throw new Error(`Polymarket: ${res.status}`);
  const events = await res.json();

  const markets: Market[] = [];
  for (const event of events) {
    if (!event.markets?.length) continue;
    // Take only top 2 markets per event to avoid flooding
    const topMarkets = event.markets.slice(0, 2);
    for (const m of topMarkets) {
      let prices: string[] = ['0.5', '0.5'];
      try { prices = JSON.parse(m.outcomePrices); } catch {}

      const yesPrice = parseFloat(String(prices[0])) || 0.5;
      const volume = parseFloat(m.volume) || 0;
      const v24h = m.volume24hr || 0;

      markets.push({
        id: `poly_${m.id}`,
        platform: 'polymarket',
        question: m.question || m.groupItemTitle || event.title,
        description: m.description || event.description || '',
        category: deriveCategory(
          event.tags?.map((t: { label: string }) => t.label) || [],
          m.question || event.title || ''
        ),
        image: m.image || event.image,
        outcomes: [
          { name: 'Yes', price: yesPrice },
          { name: 'No', price: 1 - yesPrice },
        ],
        volume,
        volume24h: v24h,
        liquidity: parseFloat(m.liquidity) || 0,
        endDate: m.endDate || event.endDate || null,
        status: m.active ? 'active' : m.closed ? 'closed' : 'resolved',
        createdAt: m.createdAt || event.createdAt || new Date().toISOString(),
        url: `https://polymarket.com/event/${event.slug || m.slug}`,
        tags: event.tags?.map((t: { label: string }) => t.label) || [],
        pulseIntensity: calcPulseIntensity(yesPrice),
        shockwaveStrength: calcShockwave(v24h, volume),
      });
    }
  }
  return markets;
}

// ─── Kalshi ───────────────────────────────────────────────
async function fetchKalshi(limit = 30): Promise<Market[]> {
  const allMarkets: Market[] = [];
  let cursor: string | undefined;
  const perPage = 100;
  const maxPages = Math.ceil(limit / perPage);

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      endpoint: 'events',
      limit: String(perPage),
      status: 'open',
      with_nested_markets: 'true',
    });
    if (cursor) params.set('cursor', cursor);

    const res = await fetch(`/api/kalshi?${params}`);
    if (!res.ok) throw new Error(`Kalshi: ${res.status}`);
    const data = await res.json();
    const events = data.events || [];

    for (const event of events) {
      const eventMarkets = event.markets || [];
      for (const m of eventMarkets) {
        const yesPrice = m.yes_ask_dollars
          ? parseFloat(m.yes_ask_dollars)
          : (m.yes_ask || 50) / 100;
        const volume = m.volume || 0;
        const v24h = m.volume_24h || 0;

        allMarkets.push({
          id: `kalshi_${m.ticker}`,
          platform: 'kalshi',
          question: m.title || event.title,
          description: m.rules_primary || event.sub_title || '',
          category: deriveCategory(
            [event.category || ''],
            m.title || event.title || ''
          ),
          image: undefined,
          outcomes: [
            { name: m.yes_sub_title || 'Yes', price: yesPrice, tokenId: m.ticker },
            { name: m.no_sub_title || 'No', price: 1 - yesPrice, tokenId: m.ticker },
          ],
          volume,
          volume24h: v24h,
          liquidity: m.liquidity ? parseFloat(m.liquidity_dollars || '0') : 0,
          endDate: m.close_time || m.expiration_time || null,
          status: m.status === 'open' || m.status === 'active' ? 'active' : 'closed',
          createdAt: m.created_time || new Date().toISOString(),
          url: `https://kalshi.com/markets/${m.ticker}`,
          tags: event.category ? [event.category] : [],
          pulseIntensity: calcPulseIntensity(yesPrice),
          shockwaveStrength: calcShockwave(v24h, volume),
        });
      }
    }

    cursor = data.cursor;
    if (!cursor || allMarkets.length >= limit) break;
  }

  return allMarkets.slice(0, limit);
}

// ─── Opinion ──────────────────────────────────────────────
async function fetchOpinion(limit = 30): Promise<Market[]> {
  const pages = Math.ceil(limit / 20);
  const promises = Array.from({ length: Math.min(pages, 5) }, (_, i) => {
    const params = new URLSearchParams({
      endpoint: 'topic',
      limit: '20',
      page: String(i + 1),
      sortBy: '1', // volume
      status: '2', // active
    });
    return fetch(`/api/opinion?${params}`).then(r => r.ok ? r.json() : null);
  });

  const responses = await Promise.allSettled(promises);
  const markets: Market[] = [];

  for (const result of responses) {
    if (result.status !== 'fulfilled' || !result.value) continue;
    const data = result.value;
    // Opinion response: {errno, result: {list: [...], total}} or {data: [...]}
    const topics = Array.isArray(data)
      ? data
      : (data.result?.list || data.data || data.list || []);

    for (const t of topics) {
      // status 2 = active (Opinion uses numeric status)
      if (t.status !== 2 && t.status !== 'Activated' && t.status !== '2') continue;

      const yesPrice = parseFloat(t.yesBuyPrice || t.yesMarketPrice || '0.5');
      const volumeStr = String(t.volume || '0').replace(/[$,]/g, '');
      const volume = parseFloat(volumeStr) || 0;
      const v24hStr = String(t.volume24h || '0').replace(/[$,]/g, '');
      const v24h = parseFloat(v24hStr) || 0;

      markets.push({
        id: `opinion_${t.topicId}`,
        platform: 'opinion',
        question: t.title || t.titleShort || '',
        description: t.abstract || t.rules || '',
        category: deriveCategory(
          t.labelName || [],
          t.title || ''
        ),
        image: t.thumbnailUrl,
        outcomes: [
          { name: t.yesLabel || 'Yes', price: yesPrice },
          { name: t.noLabel || 'No', price: 1 - yesPrice },
        ],
        volume,
        volume24h: v24h,
        liquidity: 0,
        endDate: t.cutoffTime ? new Date(t.cutoffTime * 1000).toISOString() : null,
        status: 'active',
        createdAt: t.createTime ? new Date(t.createTime * 1000).toISOString() : new Date().toISOString(),
        url: `https://opinion.trade/topic/${t.topicId}`,
        tags: t.labelName || [],
        pulseIntensity: calcPulseIntensity(yesPrice),
        shockwaveStrength: calcShockwave(v24h, volume),
      });
    }
  }

  return markets.slice(0, limit);
}

// ─── Aggregator ───────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out`)), ms)
    ),
  ]);
}

export async function fetchAllMarkets(
  limit = 30,
  platforms: Platform[] = ['polymarket', 'kalshi', 'opinion']
): Promise<FetchResult> {
  const errors: FetchResult['errors'] = [];
  const allMarkets: Market[] = [];

  const fetchers: { platform: Platform; fn: () => Promise<Market[]>; timeout: number }[] = [
    { platform: 'polymarket', fn: () => fetchPolymarket(limit * 3), timeout: 15000 },
    { platform: 'kalshi', fn: () => fetchKalshi(limit * 3), timeout: 20000 },
    { platform: 'opinion', fn: () => fetchOpinion(limit * 3), timeout: 20000 },
  ];

  const results = await Promise.allSettled(
    fetchers
      .filter(f => platforms.includes(f.platform))
      .map(async (f) => {
        const markets = await withTimeout(f.fn(), f.timeout, f.platform);
        return { platform: f.platform, markets };
      })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allMarkets.push(...result.value.markets);
    } else {
      const msg = result.reason?.message || String(result.reason);
      const platform = msg.includes('Polymarket') ? 'polymarket'
        : msg.includes('Kalshi') ? 'kalshi'
        : msg.includes('Opinion') ? 'opinion'
        : 'polymarket';
      errors.push({ platform: platform as Platform, error: msg });
    }
  }

  // Filter: exclude extreme probabilities (0-10%, 90-100%), closed/ended markets
  const filtered = allMarkets.filter(m => {
    const yesPrice = m.outcomes[0]?.price ?? 0.5;
    if (yesPrice < 0.10 || yesPrice > 0.90) return false;
    if (m.status === 'closed' || m.status === 'resolved') return false;
    if (m.endDate && new Date(m.endDate).getTime() < Date.now()) return false;
    return true;
  });

  // Sort by volume descending
  filtered.sort((a, b) => b.volume - a.volume);

  return { markets: filtered, errors, timestamp: Date.now() };
}

export { formatVolume };
