import {
  alertRadiusFor,
  emptyCooldownState,
  evaluate,
  isAhead,
  TUNING,
  type Fix,
  type Hotspot,
} from '../src/services/proximity';
import { distanceMeters } from '../src/services/geo';

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${label}` +
      (ok ? '' : `\n        expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  );
}
function approx(label: string, actual: number, expected: number, tol: number) {
  const ok = Math.abs(actual - expected) <= tol;
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label} (${actual.toFixed(0)} vs ${expected}±${tol})`);
}

const NOW = 1_760_000_000_000;

const hotspot = (over: Partial<Hotspot> = {}): Hotspot => ({
  id: 'h1',
  name: 'Kwame Nkrumah Interchange',
  latitude: 5.6037,
  longitude: -0.187,
  radiusM: 300,
  riskScore: 80,
  severity: 'CRITICAL',
  dominantType: 'ACCIDENT',
  incidentCount: 12,
  status: 'ACTIVE',
  ...over,
});

/** A fix `meters` due SOUTH of the hotspot, i.e. driving north toward it. */
function fixSouthOf(h: Hotspot, meters: number, over: Partial<Fix> = {}): Fix {
  const latOffset = meters / 111_320;
  return {
    latitude: h.latitude - latOffset,
    longitude: h.longitude,
    speed: 25, // ~90 km/h
    heading: 0, // due north = straight at it
    timestamp: NOW,
    ...over,
  };
}

// ── Speed-scaled radius ────────────────────────────────────────────────────
approx('stationary uses the floor lead', alertRadiusFor(0, 300), 300 + TUNING.MIN_LEAD_M, 1);
approx('30 km/h (8.3 m/s) -> ~166m lead', alertRadiusFor(8.3, 300), 300 + 166, 5);
approx('100 km/h (27.8 m/s) -> ~556m lead', alertRadiusFor(27.8, 300), 300 + 556, 5);
approx('absurd speed clamps to max lead', alertRadiusFor(999, 300), 300 + TUNING.MAX_LEAD_M, 1);
check('null speed is handled', alertRadiusFor(null, 300), 300 + TUNING.MIN_LEAD_M);

// Faster really does mean earlier warning — the whole point.
check(
  'faster => larger radius',
  alertRadiusFor(27.8, 300) > alertRadiusFor(8.3, 300),
  true
);

// ── Heading filter ─────────────────────────────────────────────────────────
const h = hotspot();
check('driving north at a hotspot to the north = ahead', isAhead(fixSouthOf(h, 400), h), true);
check(
  'driving south away from it = not ahead',
  isAhead(fixSouthOf(h, 400, { heading: 180 }), h),
  false
);
check(
  'perpendicular (east) is outside the cone',
  isAhead(fixSouthOf(h, 400, { heading: 90 }), h),
  false
);
check(
  'slight drift (30 deg) still counts as ahead',
  isAhead(fixSouthOf(h, 400, { heading: 30 }), h),
  true
);
check(
  'crawling: heading ignored, treated as ahead',
  isAhead(fixSouthOf(h, 400, { heading: 180, speed: 1 }), h),
  true
);
check(
  'unknown heading: treated as ahead (fail-safe)',
  isAhead(fixSouthOf(h, 400, { heading: null }), h),
  true
);

// ── Firing ─────────────────────────────────────────────────────────────────
let state = emptyCooldownState();
let r = evaluate(fixSouthOf(h, 500), [h], state, NOW);
check('fires when approaching within radius', r.alerts.length, 1);
check('critical hotspot -> critical level', r.alerts[0]?.level, 'critical');
check('speaks for critical', (r.alerts[0]?.spoken ?? '').length > 0, true);
check('records ETA at speed', typeof r.alerts[0]?.etaSeconds, 'number');
approx('ETA ≈ distance/speed', r.alerts[0]!.etaSeconds!, 500 / 25, 3);
state = r.state;

// ── Re-entry suppression ───────────────────────────────────────────────────
r = evaluate(fixSouthOf(h, 450), [h], state, NOW + 5_000);
check('does not repeat while still inside', r.alerts.length, 0);
state = r.state;

// Drive far away — leaves the zone, clearing `inside`.
r = evaluate(fixSouthOf(h, 40_000), [h], state, NOW + 10_000);
check('no alert when far away', r.alerts.length, 0);
check('exiting clears inside-state', r.state.inside.length, 0);
state = r.state;

// Come back within the cooldown window: still suppressed.
r = evaluate(fixSouthOf(h, 500), [h], state, NOW + 60_000);
check('re-entry inside cooldown stays silent', r.alerts.length, 0);
state = r.state;

// Staying put inside the zone while the cooldown expires must NOT alert —
// you are already there, the warning was about approaching.
r = evaluate(fixSouthOf(h, 500), [h], state, NOW + TUNING.COOLDOWN_MS + 1000);
check('no alert for sitting inside when cooldown lapses', r.alerts.length, 0);
state = r.state;

// Drive away, then genuinely approach again after the cooldown: alerts.
state = evaluate(fixSouthOf(h, 40_000), [h], state, NOW + TUNING.COOLDOWN_MS + 2000).state;
r = evaluate(fixSouthOf(h, 500), [h], state, NOW + TUNING.COOLDOWN_MS + 3000);
check('re-arms on a fresh approach after cooldown', r.alerts.length, 1);

// ── Suppression rules ──────────────────────────────────────────────────────
check(
  'low-risk hotspot never interrupts',
  evaluate(fixSouthOf(h, 400), [hotspot({ riskScore: 5, currentRisk: 5, severity: 'LOW' })], emptyCooldownState(), NOW)
    .alerts.length,
  0
);
check(
  'mitigated hotspot never alerts',
  evaluate(fixSouthOf(h, 400), [hotspot({ status: 'MITIGATED' })], emptyCooldownState(), NOW).alerts.length,
  0
);
check(
  'hotspot behind you is skipped',
  evaluate(fixSouthOf(h, 400, { heading: 180 }), [h], emptyCooldownState(), NOW).alerts.length,
  0
);
check(
  'time-of-day risk is respected over base score',
  evaluate(
    fixSouthOf(h, 400),
    [hotspot({ riskScore: 90, currentRisk: 5, severity: 'LOW' })],
    emptyCooldownState(),
    NOW
  ).alerts.length,
  0
);
check(
  'bad coordinates are ignored',
  evaluate(fixSouthOf(h, 400), [hotspot({ latitude: NaN })], emptyCooldownState(), NOW).alerts.length,
  0
);

// ── Ordering ───────────────────────────────────────────────────────────────
const far = hotspot({ id: 'far', latitude: h.latitude + 0.001, severity: 'CRITICAL', riskScore: 90 });
const near = hotspot({ id: 'near', severity: 'MEDIUM', riskScore: 50, currentRisk: 50 });
const multi = evaluate(fixSouthOf(h, 500), [near, far], emptyCooldownState(), NOW);
check('two hotspots both fire', multi.alerts.length, 2);
check('critical is ordered first', multi.alerts[0].level, 'critical');

// ── Sanity on the geometry helper the tests lean on ────────────────────────
approx(
  'fixSouthOf really is ~500m away',
  distanceMeters(fixSouthOf(h, 500), h),
  500,
  5
);

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
