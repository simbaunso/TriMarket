export const POLYMARKET_API_ENDPOINTS = {
  gamma: 'https://gamma-api.polymarket.com',
  data: 'https://data-api.polymarket.com',
  clob: 'https://clob.polymarket.com',
} as const;

export const POLYMARKET_PROXY_ENDPOINTS = {
  gamma: '/proxy/poly/gamma',
  data: '/proxy/poly/data',
  clob: '/proxy/poly/clob',
} as const;

export const POLYMARKET_COLLATERAL_CURRENCY = 'pUSD';

export const REAL_TRADING_ENABLED = false;

export const POLYMARKET_TRADING_CONFIG = {
  enabled: REAL_TRADING_ENABLED,
  mode: 'disabled-read-only-viewer',
  collateralCurrency: POLYMARKET_COLLATERAL_CURRENCY,
  clobEndpoint: POLYMARKET_API_ENDPOINTS.clob,
} as const;

export function isRealTradingEnabled(): false {
  return false;
}
