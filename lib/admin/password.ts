import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * scrypt password hashing (node:crypto, no native dependency).
 *
 * Stored format:  scrypt:<log2N>:<r>:<p>:<salt base64url>:<hash base64url>
 *                 (colons, not "$": survives shells and .env variable expansion)
 * Default cost:   N = 2^17, r = 8, p = 1 (OWASP password-storage minimum
 *                 for scrypt), 16-byte random salt, 64-byte derived key.
 *                 ~128 MiB and a few hundred ms per verification -- fine
 *                 for a single owner login, expensive for an attacker.
 * The parameters live in the hash string, so the cost can be raised later
 * without invalidating existing hashes.
 */

const DEFAULT_LOG2N = 17;
const DEFAULT_R = 8;
const DEFAULT_P = 1;
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer, log2n: number, r: number, p: number): Promise<Buffer> {
  const N = 2 ** log2n;
  const options: ScryptOptions = { N, r, p, maxmem: 128 * N * r * p + 32 * 1024 * 1024 };
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, options, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashPassword(password: string, log2n = DEFAULT_LOG2N): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, log2n, DEFAULT_R, DEFAULT_P);
  return ["scrypt", log2n, DEFAULT_R, DEFAULT_P, salt.toString("base64url"), key.toString("base64url")].join(":");
}

interface ParsedHash {
  log2n: number;
  r: number;
  p: number;
  salt: Buffer;
  key: Buffer;
}

function parseHash(stored: string): ParsedHash | null {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return null;
  const [log2n, r, p] = parts.slice(1, 4).map(Number);
  // Refuse absurd parameters (a tampered env var must not DoS the server).
  if (!Number.isInteger(log2n) || log2n < 14 || log2n > 20) return null;
  if (!Number.isInteger(r) || r < 1 || r > 32 || !Number.isInteger(p) || p < 1 || p > 4) return null;
  const salt = Buffer.from(parts[4], "base64url");
  const key = Buffer.from(parts[5], "base64url");
  if (salt.length < 16 || key.length !== KEY_LENGTH) return null;
  return { log2n, r, p, salt, key };
}

/** Constant-time verification. Returns false (never throws) for a
 * malformed hash. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parsed = parseHash(stored);
  if (!parsed) return false;
  const candidate = await derive(password, parsed.salt, parsed.log2n, parsed.r, parsed.p);
  return candidate.length === parsed.key.length && timingSafeEqual(candidate, parsed.key);
}
