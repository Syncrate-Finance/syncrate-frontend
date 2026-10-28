import { NextRequest, NextResponse } from "next/server";
import { readServerEnvironment } from "./server/environment";
import {
  cookieName,
  cookieOptions,
  openSession,
  privateHeaders,
  providerClient,
  sealSession,
  sessionData,
} from "./server/cms/supabase-session";

export async function proxy(request: NextRequest) {
  const env = readServerEnvironment();
  if (env.CMS_AUTH_PROVIDER !== "supabase") return NextResponse.next();
  // Keep host-only staff cookies and Payload's configured API origin together.
  if (
    env.APP_ENV === "preview" &&
    request.method === "GET" &&
    !request.nextUrl.pathname.startsWith("/cms-api") &&
    request.nextUrl.origin !== env.SERVER_URL
  ) {
    const canonical = new URL(request.nextUrl.pathname, env.SERVER_URL);
    canonical.search = request.nextUrl.search;
    return NextResponse.redirect(canonical, {
      status: 307,
      headers: privateHeaders,
    });
  }
  const headers = new Headers(request.headers);
  // Never forward visitor-supplied identity assertions.
  headers.delete("x-syncrate-identity");
  const session = await openSession(
    request.cookies.get(cookieName(env))?.value,
    env,
  );
  let updated: string | undefined;
  let clear = false;
  if (session && session.expiresAt < Date.now() / 1000 + 120) {
    try {
      const { data, error } = await providerClient(env).auth.refreshSession({
        refresh_token: session.refreshToken,
      });
      if (error || !data.session) clear = true;
      else {
        updated = await sealSession(
          sessionData(data.session, session.startedAt),
          env,
        );
        request.cookies.set(cookieName(env), updated);
      }
    } catch {
      clear = true;
    }
  }
  if (clear) request.cookies.delete(cookieName(env));
  headers.set("cookie", request.cookies.toString());
  const response = NextResponse.next({ request: { headers } });
  for (const [name, value] of Object.entries(privateHeaders))
    response.headers.set(name, value);
  if (updated)
    response.cookies.set(cookieName(env), updated, cookieOptions(env));
  if (clear)
    response.cookies.set(cookieName(env), "", {
      ...cookieOptions(env),
      maxAge: 0,
    });
  return response;
}
export const config = {
  matcher: ["/cms/:path*", "/cms-api/:path*", "/staff/:path*"],
};
