import { NextRequest, NextResponse } from 'next/server';

const OPINION_PUBLIC = 'https://proxy.opinion.trade:8443/api/bsc/api/v2';
const OPINION_OPENAPI = 'https://proxy.opinion.trade:8443/openapi';

const PUBLIC_ENDPOINTS = ['topic', 'label', 'indicator', 'currency', 'activity'];
const AUTH_ENDPOINTS = ['market', 'orderbook', 'trade', 'token'];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'topic';

  const isPublic = PUBLIC_ENDPOINTS.some(e => endpoint === e || endpoint.startsWith(e + '/'));
  const isAuth = AUTH_ENDPOINTS.some(e => endpoint === e || endpoint.startsWith(e + '/'));

  if (!isPublic && !isAuth) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  }

  const params = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') params.set(key, value);
  });

  const baseUrl = isAuth ? OPINION_OPENAPI : OPINION_PUBLIC;
  const headers: Record<string, string> = {};

  if (isAuth) {
    const apiKey = process.env.OPINION_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Opinion API key not configured' }, { status: 401 });
    }
    headers.apikey = apiKey;
  }

  try {
    const res = await fetch(`${baseUrl}/${endpoint}?${params.toString()}`, {
      headers,
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    );
  }
}
