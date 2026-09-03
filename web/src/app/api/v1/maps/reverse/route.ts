import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Azure Maps reverse geocoding — coordinates to a place name.
 *
 * Needed so the app can say "Dzorwulu" instead of "5.6037, -0.1870". The
 * subscription key stays server-side like the other Maps proxies.
 *
 * Returns the *area* rather than a street address: the app uses this to label
 * a region whose incidents you are looking at, so "Dzorwulu, Accra" is the
 * useful answer and "12 Sunflower Street" is not.
 */

const AZURE_REVERSE_URL = 'https://atlas.microsoft.com/search/address/reverse/json';

export async function GET(req: NextRequest) {
  const key = process.env.AZURE_MAPS_KEY;
  const sp = req.nextUrl.searchParams;
  const lat = Number(sp.get('lat'));
  const lng = Number(sp.get('lng'));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
  }

  if (!key) {
    return NextResponse.json(
      { error: 'Reverse geocoding is not configured.', detail: 'Set AZURE_MAPS_KEY in web/.env.' },
      { status: 503 }
    );
  }

  try {
    const url = new URL(AZURE_REVERSE_URL);
    url.searchParams.set('api-version', '1.0');
    url.searchParams.set('subscription-key', key);
    url.searchParams.set('query', `${lat},${lng}`);
    // Ask for the neighbourhood/municipality rather than a house number.
    url.searchParams.set('entityType', 'Municipality,MunicipalitySubdivision,CountrySecondarySubdivision');

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Azure Maps rejected the reverse lookup', status: res.status },
        { status: 502 }
      );
    }

    const data = await res.json();
    const first = data.addresses?.[0]?.address;

    // Prefer the most human-recognisable label available, narrowest first.
    const name =
      first?.municipalitySubdivision ??
      first?.municipality ??
      first?.countrySecondarySubdivision ??
      first?.countrySubdivision ??
      null;

    const region = first?.countrySubdivision ?? first?.municipality ?? null;

    return NextResponse.json({
      name,
      region,
      label: name && region && name !== region ? `${name}, ${region}` : (name ?? region),
      latitude: lat,
      longitude: lng,
    });
  } catch {
    return NextResponse.json({ error: 'Reverse lookup failed' }, { status: 500 });
  }
}
