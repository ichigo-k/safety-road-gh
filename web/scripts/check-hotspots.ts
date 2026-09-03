import { deriveHotspots, riskAtHour, type IncidentInput } from '../src/lib/hotspots';
import { distanceMeters, bearingDegrees, bearingDelta } from '../src/lib/geo';

const NOW = new Date('2026-09-03T12:00:00Z');
const daysAgo = (d: number, hour = 12) => {
  const t = new Date(NOW.getTime() - d * 86_400_000);
  t.setHours(hour, 0, 0, 0);
  return t;
};

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`}`);
}
function approx(label: string, actual: number, expected: number, tol: number) {
  const ok = Math.abs(actual - expected) <= tol;
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label} (${actual.toFixed(1)} vs ${expected}±${tol})`);
}

// ── geo ────────────────────────────────────────────────────────────────────
// Accra (5.6037,-0.187) to Tema (5.6698,-0.0166): ~19.4 km by great circle.
approx(
  'haversine Accra->Tema ≈ 20.2km',
  distanceMeters({ latitude: 5.6037, longitude: -0.187 }, { latitude: 5.6698, longitude: -0.0166 }),
  20_240,
  200
);

// Due east should read ~90 degrees.
approx(
  'bearing due east ≈ 90',
  bearingDegrees({ latitude: 5.6, longitude: -0.19 }, { latitude: 5.6, longitude: -0.15 }),
  90,
  1
);
approx('bearingDelta wraps 350 vs 10 = 20', bearingDelta(350, 10), 20, 0.001);

// The bug this replaces: flat degree math treats lat and lng as equal. At
// Accra's latitude a degree of longitude is ~0.5% shorter than a degree of
// latitude, but nearer the poles the error is severe. Check the helper is
// genuinely latitude-aware by comparing the same delta at two latitudes.
const dEquator = distanceMeters({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 });
const dNorth = distanceMeters({ latitude: 60, longitude: 0 }, { latitude: 60, longitude: 1 });
approx('1 deg lng at 60N is half that at equator', dNorth / dEquator, 0.5, 0.01);

// ── clustering ─────────────────────────────────────────────────────────────
const mk = (
  id: string,
  lat: number,
  lng: number,
  type: 'ACCIDENT' | 'HAZARD',
  createdAt: Date,
  injured = 0,
  location = 'Spintex Road'
): IncidentInput => ({ id, type, latitude: lat, longitude: lng, location, injuredCount: injured, createdAt });

// Three incidents within ~150m, one 5km away.
const spots = deriveHotspots(
  [
    mk('a', 5.6037, -0.187, 'ACCIDENT', daysAgo(5), 2),
    mk('b', 5.6042, -0.1872, 'ACCIDENT', daysAgo(20), 1),
    mk('c', 5.6039, -0.1868, 'HAZARD', daysAgo(40)),
    mk('d', 5.65, -0.187, 'ACCIDENT', daysAgo(10), 0, 'Achimota'),
  ],
  NOW
);

check('4 incidents -> 2 hotspots', spots.length, 2);
check('tight group clustered together', spots[0].incidentCount, 3);
check('hotspot named from most common location', spots[0].name, 'Spintex Road');
check('casualties summed', spots[0].casualtyCount, 3);
check('dominant type is ACCIDENT (2 of 3)', spots[0].dominantType, 'ACCIDENT');
check('sorted by risk, busiest first', spots[0].riskScore > spots[1].riskScore, true);

// Radius must cover the real spread, padded, and never below the floor.
check('radius >= floor', spots[0].radiusM >= 250, true);
check('radius <= ceiling', spots[0].radiusM <= 1200, true);

// ── recency decay ──────────────────────────────────────────────────────────
const fresh = deriveHotspots([mk('x', 5.6, -0.18, 'ACCIDENT', daysAgo(1))], NOW)[0];
const stale = deriveHotspots([mk('y', 5.6, -0.18, 'ACCIDENT', daysAgo(365))], NOW)[0];
check('recent incident outranks year-old one', fresh.riskScore > stale.riskScore * 4, true);

// Half-life: a 90-day-old incident should score ~half a fresh one.
const halfLife = deriveHotspots([mk('z', 5.6, -0.18, 'ACCIDENT', daysAgo(90))], NOW)[0];
approx('90 days ≈ half weight', halfLife.riskScore / fresh.riskScore, 0.5, 0.05);

// ── casualties and type ────────────────────────────────────────────────────
const withInjuries = deriveHotspots([mk('i', 5.6, -0.18, 'ACCIDENT', daysAgo(5), 8)], NOW)[0];
const noInjuries = deriveHotspots([mk('j', 5.6, -0.18, 'ACCIDENT', daysAgo(5), 0)], NOW)[0];
check('injuries raise the score', withInjuries.riskScore > noInjuries.riskScore, true);

const hazardOnly = deriveHotspots([mk('h', 5.6, -0.18, 'HAZARD', daysAgo(5))], NOW)[0];
check('accident outweighs hazard', noInjuries.riskScore > hazardOnly.riskScore, true);

// ── saturation ─────────────────────────────────────────────────────────────
const many = deriveHotspots(
  Array.from({ length: 200 }, (_, i) => mk(`m${i}`, 5.6 + i * 1e-6, -0.18, 'ACCIDENT', daysAgo(3), 5)),
  NOW
)[0];
check('score never exceeds 100', many.riskScore <= 100, true);
check('massive cluster is CRITICAL', many.severity, 'CRITICAL');

// ── hour profile ───────────────────────────────────────────────────────────
const nightly = deriveHotspots(
  [
    mk('n1', 5.6, -0.18, 'ACCIDENT', daysAgo(2, 22)),
    mk('n2', 5.6001, -0.18, 'ACCIDENT', daysAgo(9, 23)),
    mk('n3', 5.6002, -0.18, 'ACCIDENT', daysAgo(16, 22)),
  ],
  NOW
)[0];
check('hour profile has 24 buckets', nightly.hourProfile.length, 24);
check('peak bucket normalised to 1', Math.max(...nightly.hourProfile), 1);
check('night hours carry the weight', nightly.hourProfile[22] > nightly.hourProfile[9], true);

const atNight = riskAtHour(nightly.riskScore, nightly.hourProfile, 22);
const atMorning = riskAtHour(nightly.riskScore, nightly.hourProfile, 9);
check('night risk exceeds morning risk', atNight > atMorning, true);
check('quiet hours still register (floored)', atMorning >= nightly.riskScore * 0.44, true);
check('peak hour never exceeds base score', atNight <= nightly.riskScore + 0.1, true);

// ── edge cases ─────────────────────────────────────────────────────────────
check('empty input -> no hotspots', deriveHotspots([], NOW).length, 0);
check(
  'non-finite coords are dropped',
  deriveHotspots([mk('bad', NaN, -0.18, 'ACCIDENT', daysAgo(1))], NOW).length,
  0
);
check('malformed hour profile falls through', riskAtHour(50, [1, 2], 12), 50);

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
