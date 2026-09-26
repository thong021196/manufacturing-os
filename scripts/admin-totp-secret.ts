/**
 * Generate ADMIN_TOTP_SECRET (enables 2FA on /admin once set) and the
 * otpauth:// URI to add it to an authenticator app.
 *
 *   npm run admin:totp-secret                      # human-readable
 *   npm run -s admin:totp-secret -- --json --account owner
 *   npm run -s admin:totp-secret -- --check <SECRET>   # prints the current code, to confirm the app matches
 */
import { base32Decode, generateTotpSecret, totpCode, totpCounter, totpUri } from "@/lib/admin/totp";

function main() {
  const argv = process.argv.slice(2);
  const accountIdx = argv.indexOf("--account");
  const account = accountIdx >= 0 ? argv[accountIdx + 1] ?? "owner" : "owner";

  const checkIdx = argv.indexOf("--check");
  if (checkIdx >= 0) {
    const secret = base32Decode(argv[checkIdx + 1] ?? "");
    if (!secret || secret.length < 10) throw new Error("Not a valid base32 TOTP secret.");
    process.stdout.write(`${totpCode(secret, totpCounter(Date.now()))}\n`);
    return;
  }

  const secret = generateTotpSecret();
  const uri = totpUri(secret, account);
  if (argv.includes("--json")) {
    process.stdout.write(JSON.stringify({ secret, otpauthUri: uri }) + "\n");
    return;
  }
  process.stderr.write("ADMIN_TOTP_SECRET (store in Secrets Manager; also add to your authenticator app):\n");
  process.stdout.write(`${secret}\n`);
  process.stderr.write(`\nAuthenticator URI (paste into the app, or render as a QR code locally):\n${uri}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`error: ${(error as Error).message}\n`);
  process.exit(1);
}
