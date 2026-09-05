'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import 'swagger-ui-react/swagger-ui.css';

// swagger-ui-react touches the DOM on mount, so it can only run in the
// browser. Load it client-side with SSR disabled.
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <p className="p-6 text-body text-ink-500">Loading API reference…</p>,
});

export default function ApiDocsPage() {
  return (
    <main className="min-h-[100dvh] bg-canvas">
      <header className="border-b border-line bg-surface px-5 py-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-caption text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.1} />
          Back
        </Link>
      </header>
      <SwaggerUI url="/api/openapi.json" />
    </main>
  );
}
