"use client";

import { useActionState, useEffect } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";

const inputClass =
  "mt-1 block w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-navy-900 focus:border-accent focus:outline-none";

export function LoginForm({ next, totpRequired }: { next: string; totpRequired: boolean }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  // The session cookie is SameSite=Strict, so it is NOT sent when the owner
  // arrives from a link in the new-RFQ email (a cross-site navigation) and
  // the proxy sends them here. A same-origin fetch from this page does carry
  // the cookie: if the session is actually valid, continue to `next`
  // without asking for the password again.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/session", { credentials: "same-origin", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { authenticated?: boolean } | null) => {
        if (!cancelled && data?.authenticated) window.location.replace(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [next]);

  return (
    <form action={formAction} className="mt-5 space-y-4" autoComplete="on">
      <input type="hidden" name="next" value={next} />
      <label className="block text-xs font-medium text-navy-800">
        Username
        <input name="username" autoComplete="username" required defaultValue={state.username} key={state.username} className={inputClass} />
      </label>
      <label className="block text-xs font-medium text-navy-800">
        Password
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </label>
      {totpRequired && (
        <label className="block text-xs font-medium text-navy-800">
          Authenticator code
          <input
            name="totp"
            inputMode="numeric"
            pattern="[0-9 ]{6,7}"
            autoComplete="one-time-code"
            required
            className={inputClass}
          />
        </label>
      )}
      {state.error && (
        <p role="alert" className="rounded-md border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-accent px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
