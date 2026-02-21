export type Platform = 'polymarket' | 'kalshi' | 'opinion';

export interface Outcome {
  name: string;
  price: number;       // 0-1 range
  tokenId?: string;
}

export interface Market {
  id: string;
  platform: Platform;
  question: string;
  description: string;
  category: string;
  image?: string;
  outcomes: Outcome[];
  volume: number;
  volume24h?: number;
  liquidity?: number;
  endDate: string | null;
  status: 'active' | 'closed' | 'resolved';
  createdAt: string;
  url: string;
  tags?: string[];
  // Pulse wall data
  pulseIntensity: number;   // 0-1 based on probability confidence
  shockwaveStrength: number; // 0-1 based on volume spike
}

export interface FetchResult {
  markets: Market[];
  errors: { platform: Platform; error: string }[];
  timestamp: number;
}

export type CategoryFilter = 'all' | 'politics' | 'crypto' | 'sports' | 'macro' | 'geopolitics' | 'tech' | 'culture';

export type ThemeMode = 'dark-concrete' | 'light-raw' | 'crt-scanline';
