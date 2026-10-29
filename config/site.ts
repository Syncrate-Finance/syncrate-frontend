export const APP_ORIGIN = "https://app.syncrate.org";
export const WEBSITE_ORIGIN = "https://syncrate.org";

/** Preview-only review surface; never enables the app on the production marketing host. */
export function isAppSurface(
  host: string | null,
  environment: string | undefined,
  preview: unknown,
) {
  const hostname = host?.trim().toLowerCase().replace(/:\d+$/, "");
  if (hostname === "app.syncrate.org") return true;
  if (
    !["local", "test", "preview"].includes(environment ?? "") ||
    preview !== "app"
  )
    return false;
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    Boolean(hostname && /^[a-z0-9-]+\.vercel\.app$/.test(hostname))
  );
}
