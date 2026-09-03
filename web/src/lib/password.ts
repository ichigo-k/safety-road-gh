/* ─── Password hashing ─────────────────────────────────────────────────────
 *
 * The single source of truth for turning a password into a stored hash.
 *
 * It exists because there were two: the seed script hashed with a hardcoded
 * salt while the login path hashed with a different one from the environment.
 * The hashes could never match, so the seeded admin account could not sign in
 * at all — and nothing failed loudly, it just always said the password was
 * wrong. Anything that hashes or verifies a password must import from here.
 *
 * Two problems fixed alongside that:
 *
 *   · A single shared salt meant two users with the same password stored the
 *     same hash, and one precomputed table would break every account at once.
 *     Each hash now carries its own random salt.
 *   · 1,000 PBKDF2 iterations is roughly three decades out of date. OWASP's
 *     current floor for PBKDF2-HMAC-SHA512 is 210,000.
 *
 * Format: pbkdf2$<iterations>$<salt-hex>$<hash-hex>
 * Self-describing, so the cost can be raised later without stranding hashes
 * written under the old setting.
 * ------------------------------------------------------------------------ */

import crypto from 'crypto';

const ITERATIONS = 210_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';
const SALT_BYTES = 16;

/** Salt used by hashes written before per-user salts existed. */
const LEGACY_SALT = process.env.PASSWORD_SALT || 'local-only-safety-road-salt';

/** The other legacy salt — what prisma/seed.ts used to hardcode. */
const LEGACY_SEED_SALT = 'safety_road_gh_salt';

const derive = (password: string, salt: string, iterations: number) =>
  crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString('hex');

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  return `pbkdf2$${ITERATIONS}$${salt}$${derive(password, salt, ITERATIONS)}`;
}

/**
 * Constant-time comparison.
 *
 * A plain `===` on hashes leaks information through how long the comparison
 * takes before it finds a difference.
 */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

/**
 * Verify a password against a stored hash.
 *
 * Understands the current format and both legacy fixed-salt schemes, so
 * existing rows keep working and can be upgraded on next sign-in rather than
 * locking anyone out.
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;

  if (stored.startsWith('pbkdf2$')) {
    const [, iterationsRaw, salt, expected] = stored.split('$');
    const iterations = Number(iterationsRaw);
    if (!Number.isFinite(iterations) || !salt || !expected) return false;
    return safeEqual(derive(password, salt, iterations), expected);
  }

  // Legacy: a bare hex digest produced with one of the two fixed salts.
  return (
    safeEqual(derive(password, LEGACY_SALT, 1000), stored) ||
    safeEqual(derive(password, LEGACY_SEED_SALT, 1000), stored)
  );
}

/** True when a stored hash predates the current scheme and should be rewritten. */
export function needsRehash(stored: string): boolean {
  if (!stored.startsWith('pbkdf2$')) return true;
  const iterations = Number(stored.split('$')[1]);
  return !Number.isFinite(iterations) || iterations < ITERATIONS;
}
