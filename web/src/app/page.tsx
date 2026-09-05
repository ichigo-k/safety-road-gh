import Link from 'next/link';
import { BookOpen, Download, LayoutDashboard, ShieldCheck, Smartphone } from 'lucide-react';
export const metadata = {
  title: 'Safety Road GH',
  description: 'Road accident and hazard reporting for Ghana.',
};

// Re-checked every 5 minutes, so a release published by CI shows up here
// without anyone redeploying the site.
export const revalidate = 300;

const REPO = process.env.GITHUB_RELEASES_REPO ?? 'ichigo-k/Safety-Road-GH';
const FALLBACK_RELEASES = `https://github.com/${REPO}/releases/latest`;

interface Release {
  available: boolean;
  version?: string | null;
  publishedAt?: string | null;
  releaseUrl?: string;
  apk?: { url: string; sizeMb: number } | null;
}

async function getLatestRelease(): Promise<Release> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return { available: false };

    const data = await res.json();
    const apk = (data.assets ?? []).find((a: { name: string }) =>
      a.name.toLowerCase().endsWith('.apk')
    );

    return {
      available: true,
      version: data.tag_name,
      publishedAt: data.published_at,
      releaseUrl: data.html_url,
      apk: apk
        ? { url: apk.browser_download_url, sizeMb: +(apk.size / 1_048_576).toFixed(1) }
        : null,
    };
  } catch {
    // The page must render even if GitHub is unreachable.
    return { available: false };
  }
}

export default async function RootHomePage() {
  const release = await getLatestRelease();

  const apkHref = release.apk?.url ?? release.releaseUrl ?? FALLBACK_RELEASES;
  const apkDetail = release.apk
    ? `APK · ${release.version} · ${release.apk.sizeMb} MB`
    : release.available
      ? `Latest release · ${release.version}`
      : 'Latest release on GitHub';

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-canvas px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand">
            <ShieldCheck className="h-6 w-6 text-white" strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="text-heading font-semibold text-ink-900">Safety Road</h1>
            <p className="text-caption text-ink-500">Ghana road accident &amp; hazard network</p>
          </div>
        </div>

        <p className="mt-6 text-body text-ink-600">
          Report accidents and road hazards, see the hotspots ahead of you, and reach emergency
          services in one tap.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Action
            href={apkHref}
            icon={<Download className="h-5 w-5" strokeWidth={2.1} />}
            title="Download for Android"
            detail={apkDetail}
            external
            primary
          />
          <Action
            href="/admin"
            icon={<LayoutDashboard className="h-5 w-5" strokeWidth={2.1} />}
            title="Admin dashboard"
            detail="MTTD operations console"
          />
          <Action
            href="/docs"
            icon={<BookOpen className="h-5 w-5" strokeWidth={2.1} />}
            title="API documentation"
            detail="Interactive OpenAPI reference"
          />
        </div>

        {release.available && release.publishedAt ? (
          <p className="mt-6 text-micro text-ink-400">
            Latest build {release.version} · published{' '}
            {new Date(release.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        ) : null}
      </div>
    </main>
  );
}

function Action({
  href,
  icon,
  title,
  detail,
  primary,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  primary?: boolean;
  external?: boolean;
}) {
  const className = primary
    ? 'flex items-center gap-3 rounded-md bg-brand px-4 py-3.5 text-white transition-colors hover:bg-brand-press'
    : 'flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3.5 text-ink-900 transition-colors hover:bg-ink-50';

  const body = (
    <>
      <span className={primary ? 'text-white' : 'text-ink-500'}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold">{title}</span>
        <span className={`block text-micro ${primary ? 'text-white/75' : 'text-ink-500'}`}>
          {detail}
        </span>
      </span>
    </>
  );

  if (external) {
    return (
      <a href={href} className={className} rel="noreferrer">
        {body}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}
