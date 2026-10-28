"use client";
import { useState } from "react";
export function StaffLogout({ provider = "proxy" }: { provider?: string }) {
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(false);
          try {
            const response = await fetch(
              provider === "supabase"
                ? "/staff/api"
                : "/cms-api/staff-users/logout",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "logout" }),
                cache: "no-store",
              },
            );
            if (response.ok)
              window.location.assign(
                provider === "supabase" ? "/staff" : "/cms/login",
              );
            else setError(true);
          } catch {
            setError(true);
          } finally {
            setBusy(false);
          }
        }}
      >
        Sign out
      </button>
      {error && <p role="alert">Sign-out failed. Please retry.</p>}
    </div>
  );
}
