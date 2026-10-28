"use client";
import { useEffect, useState, type FormEvent } from "react";
type State = {
  ready?: boolean;
  factors?: { id: string; name: string }[];
  enrollment?: { id: string; qr: string; secret: string };
  error?: string;
};
export function StaffSignIn() {
  const [state, setState] = useState<State>({});
  const [busy, setBusy] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [invite, setInvite] = useState<{
    accessToken: string;
    refreshToken: string;
  } | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token"),
      refreshToken = params.get("refresh_token");
    if (window.location.hash) window.history.replaceState(null, "", "/staff");
    if (accessToken && refreshToken) setInvite({ accessToken, refreshToken });
  }, []);
  async function submit(body: Record<string, unknown>) {
    setBusy(true);
    try {
      const response = await fetch("/staff/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const result: State & { signedOut?: boolean } = await response.json();
      if (!response.ok) {
        setState((current) => ({
          ...current,
          error: result.error ?? "Request failed.",
        }));
        return false;
      }
      setState(result);
      setSignedIn(!result.signedOut);
      if (result.signedOut) window.location.assign("/staff");
      return true;
    } catch {
      setState((current) => ({
        ...current,
        error: "Connection failed. Try again.",
      }));
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await submit({
      action: "login",
      email: data.get("email"),
      password: data.get("password"),
    });
  }
  async function password(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmation")) {
      setState((current) => ({ ...current, error: "Passwords must match." }));
      return;
    }
    if (await submit({ action: "password", password: data.get("password") }))
      setPasswordRequired(false);
  }
  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await submit({
      action: "verify",
      factorId: data.get("factorId"),
      code: data.get("code"),
    });
  }
  const input =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900";
  const button =
    "rounded-lg bg-teal-900 px-5 py-3 text-white disabled:opacity-50";
  return (
    <main className="mx-auto min-h-[70vh] max-w-lg px-6 py-20">
      <h1 className="text-3xl font-semibold">Syncrate staff sign-in</h1>
      <p className="mt-3 text-slate-600">
        Invited staff only. An authenticator code is required to access the CMS.
      </p>
      {state.error && (
        <p
          role="alert"
          className="my-5 rounded border border-red-300 p-3 text-red-800"
        >
          {state.error}
        </p>
      )}
      {invite ? (
        <div className="mt-6">
          <p>
            Accept your staff invitation to set a password and enroll your
            authenticator.
          </p>
          <button
            className={button}
            disabled={busy}
            onClick={async () => {
              if (await submit({ action: "invitation", ...invite })) {
                setInvite(null);
                setPasswordRequired(true);
              }
            }}
          >
            Accept invitation
          </button>
        </div>
      ) : !signedIn ? (
        <form onSubmit={login} className="mt-6 space-y-5">
          <label className="block">
            Email
            <input
              className={input}
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </label>
          <label className="block">
            Password
            <input
              className={input}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className={button} disabled={busy}>
            Sign in
          </button>
          <button
            type="button"
            className="ml-4 underline"
            disabled={busy}
            onClick={() => submit({ action: "status" })}
          >
            Continue existing session
          </button>
        </form>
      ) : passwordRequired ? (
        <form onSubmit={password} className="mt-6 space-y-5">
          <label className="block">
            New password (at least 16 characters)
            <input
              className={input}
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={16}
              maxLength={128}
              required
            />
          </label>
          <label className="block">
            Confirm password
            <input
              className={input}
              name="confirmation"
              type="password"
              autoComplete="new-password"
              minLength={16}
              maxLength={128}
              required
            />
          </label>
          <button className={button} disabled={busy}>
            Set password
          </button>
        </form>
      ) : state.ready ? (
        <div className="mt-6 space-y-5">
          <p>Authenticator verified.</p>
          <a className={button} href="/cms">
            Open CMS
          </a>
        </div>
      ) : state.enrollment || state.factors?.length ? (
        <form onSubmit={verify} className="mt-6 space-y-5">
          {state.enrollment && (
            <div>
              <p>
                Scan this QR code with your authenticator. Keep the setup key
                private.
              </p>
              <img
                src={state.enrollment.qr}
                width={220}
                height={220}
                alt="Private authenticator setup QR code"
              />
              <details>
                <summary>Manual setup key</summary>
                <code className="break-all">{state.enrollment.secret}</code>
              </details>
            </div>
          )}
          <label className="block">
            Authenticator
            <select name="factorId" className={input}>
              {state.enrollment ? (
                <option value={state.enrollment.id}>New authenticator</option>
              ) : (
                state.factors?.map((factor) => (
                  <option value={factor.id} key={factor.id}>
                    {factor.name}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="block">
            Six-digit code
            <input
              className={input}
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
            />
          </label>
          <button className={button} disabled={busy}>
            Verify authenticator
          </button>
        </form>
      ) : (
        <div className="mt-6 space-y-5">
          <p>Set up an authenticator before entering the CMS.</p>
          <button
            className={button}
            disabled={busy}
            onClick={() => submit({ action: "enroll" })}
          >
            Set up authenticator
          </button>
        </div>
      )}
      {signedIn && (
        <button
          className="mt-8 underline"
          disabled={busy}
          onClick={() => submit({ action: "logout" })}
        >
          Sign out
        </button>
      )}
    </main>
  );
}
