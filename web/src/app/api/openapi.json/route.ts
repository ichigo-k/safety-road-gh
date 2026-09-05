import { NextResponse } from 'next/server';
import { openApiDocument } from '@/lib/openapi';

// Static description of the API; safe to cache.
export const dynamic = 'force-static';

/** GET /api/openapi.json — the OpenAPI 3.1 spec that /docs renders. */
export function GET() {
  return NextResponse.json(openApiDocument);
}
