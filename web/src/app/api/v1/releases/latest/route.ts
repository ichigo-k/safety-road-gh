import { NextResponse } from 'next/server';

/**
 * GET /api/v1/releases/latest
 *
 * The newest published build, so the download button always serves the
 * current APK without anyone redeploying the site. CI publishes a GitHub
 * release; this reads it.
 *
 * Cached for five minutes: the GitHub API is rate-limited (60/hour
 * unauthenticated) and a landing page can be hit far harder than that.
 */

const REPO = process.env.GITHUB_RELEASES_REPO ?? 'ichigo-k/Safety-Road-GH';

export const revalidate = 300;

export async function GET() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github+json',
        // A token lifts the rate limit but is optional — this works without.
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      // No releases yet, or GitHub is unhappy. The page falls back to the
      // releases URL rather than showing an error.
      return NextResponse.json({ available: false }, { status: 200 });
    }

    const data = await res.json();
    const assets: { name: string; browser_download_url: string; size: number }[] =
      data.assets ?? [];

    const apk = assets.find((a) => a.name.toLowerCase().endsWith('.apk'));
    const pwaZip = assets.find((a) => a.name.toLowerCase().includes('pwa'));

    return NextResponse.json({
      available: true,
      version: data.tag_name ?? null,
      name: data.name ?? null,
      publishedAt: data.published_at ?? null,
      releaseUrl: data.html_url ?? `https://github.com/${REPO}/releases/latest`,
      apk: apk
        ? { url: apk.browser_download_url, sizeMb: +(apk.size / 1_048_576).toFixed(1) }
        : null,
      pwaZip: pwaZip ? { url: pwaZip.browser_download_url } : null,
    });
  } catch {
    return NextResponse.json({ available: false }, { status: 200 });
  }
}
