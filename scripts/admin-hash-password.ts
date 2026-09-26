/**
 * Produce ADMIN_PASSWORD_HASH for the owner admin (scrypt, see
 * lib/admin/password.ts). The plaintext password is never stored anywhere
 * by this script.
 *
 *   npm run admin:hash-password                  # prompts twice, input hidden; prints the hash
 *   printf '%s' "$PW" | npm run -s admin:hash-password -- --stdin
 *   npm run -s admin:hash-password -- --generate --json
 *        # generates a strong random password and prints {"password","hash"} as
 *        # JSON on stdout -- pipe it straight into a file/secret, never a chat log
 *        # (docs/ops/LAUNCH-RUNBOOK.md, "Admin credentials").
 */
import { randomBytes } from "node:crypto";
import { hashPassword, verifyPassword } from "@/lib/admin/password";

const MIN_LENGTH = 12;

function readHidden(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) return reject(new Error("No terminal for a hidden prompt; use --stdin or --generate."));
    process.stderr.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stderr.write("\n");
          return resolve(value);
        }
        if (ch === "\u0003") {
          process.stderr.write("\n");
          process.exit(130);
        }
        if (ch === "\u007f" || ch === "\b") value = value.slice(0, -1);
        else value += ch;
      }
    };
    stdin.on("data", onData);
  });
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
}

async function main() {
  const args = new Set(process.argv.slice(2));
  let password: string;
  if (args.has("--generate")) {
    password = randomBytes(18).toString("base64url"); // 24 chars, ~144 bits
  } else if (args.has("--stdin")) {
    password = await readStdin();
  } else {
    password = await readHidden("New admin password: ");
    const again = await readHidden("Repeat password: ");
    if (again !== password) throw new Error("Passwords do not match.");
  }
  if (password.length < MIN_LENGTH) throw new Error(`Use at least ${MIN_LENGTH} characters (a passphrase is fine).`);

  const hash = await hashPassword(password);
  if (!(await verifyPassword(password, hash))) throw new Error("Self-check failed.");

  if (args.has("--json")) {
    process.stdout.write(JSON.stringify(args.has("--generate") ? { password, hash } : { hash }) + "\n");
  } else {
    if (args.has("--generate")) process.stderr.write("Generated password (store it in your password manager now):\n" + password + "\n\n");
    process.stderr.write("ADMIN_PASSWORD_HASH (safe to store in Secrets Manager; not reversible):\n");
    process.stdout.write(hash + "\n");
  }
}

main().catch((error) => {
  process.stderr.write(`error: ${(error as Error).message}\n`);
  process.exit(1);
});
