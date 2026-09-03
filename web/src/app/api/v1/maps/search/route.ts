import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Azure Maps geocoding proxy.
 *
 * Route planning starts with a person typing "Tema" or "Kotoka airport", so
 * the route screen needs somewhere to turn that into coordinates. Like the
 * routing proxy, the subscription key stays server-side: Search is billed per
 * transaction and a key in a mobile bundle can be extracted and abused.
 *
 * Results are biased to Ghana — an unbiased search for "Accra" happily
 * returns a street in another country.
 */

const AZURE_SEARCH_URL = 'https://atlas.microsoft.com/search/fuzzy/json';

/** Rough national bounding box, used to bias rather than hard-filter. */
const GHANA = { lat: 7.95, lon: -1.03, radiusM: 400_000 };

export async function GET(req: NextRequest) {
  const key = process.env.AZURE_MAPS_KEY;
  const query = req.nextUrl.searchParams.get('q')?.trim();

  if (!query) {
    return NextResponse.json({ error: 'q is required' }, { status: 400 });
  }

  if (!key) {
    return NextResponse.json(
      {
        error: 'Search is not configured.',
        detail: 'Set AZURE_MAPS_KEY in web/.env to enable destination search.',
      },
      { status: 503 }
    );
  }

  try {
    const url = new URL(AZURE_SEARCH_URL);
    url.searchParams.set('api-version', '1.0');
    url.searchParams.set('subscription-key', key);
    url.searchParams.set('query', query);
    url.searchParams.set('limit', '6');
    url.searchParams.set('countrySet', 'GH');
    // Bias toward the centre of the country rather than the device, so the
    // same query gives the same answer regardless of where it is typed.
    url.searchParams.set('lat', String(GHANA.lat));
    url.searchParams.set('lon', String(GHANA.lon));
    url.searchParams.set('radius', String(GHANA.radiusM));

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Azure Maps rejected the search', status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();

    const results = (data.results ?? [])
      .filter((r: { position?: { lat: number; lon: number } }) => r.position)
      .map(
        (r: {
          id?: string;
          type?: string;
          address?: { freeformAddress?: string; municipality?: string };
          poi?: { name?: string };
          position: { lat: number; lon: number };
        }) => ({
          id: r.id ?? `${r.position.lat},${r.position.lon}`,
          // A POI name is what a person recognises; the address is the detail.
          name: r.poi?.name ?? r.address?.freeformAddress ?? query,
          address: r.address?.freeformAddress ?? '',
          municipality: r.address?.municipality ?? '',
          latitude: r.position.lat,
          longitude: r.position.lon,
        })
      );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
