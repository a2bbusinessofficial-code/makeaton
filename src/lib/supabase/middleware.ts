import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_USER_HEADER, encodeAuthUser } from "@/lib/auth-header";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/auth", "/api/cron"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => (p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)));
}

/**
 * Runs on every request:
 * 1. Verifies the Supabase session with the auth server (and refreshes the cookie).
 * 2. Forwards the verified user to the page in a request header, so server components
 *    don't make a second auth round trip. Any client-supplied copy of that header is
 *    removed first, so it cannot be spoofed.
 * 3. Sends signed-out visitors of private pages to the login screen.
 */
export async function updateSession(request: NextRequest) {
  const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          cookiesToSet.push({ name, value, options });
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const withCookies = <T extends NextResponse>(response: T) => {
    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    return response;
  };

  if (!user && !isPublic(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return withCookies(NextResponse.redirect(url));
  }

  const headers = new Headers(request.headers);
  headers.delete(AUTH_USER_HEADER);
  if (user) headers.set(AUTH_USER_HEADER, encodeAuthUser(user));
  return withCookies(NextResponse.next({ request: { headers } }));
}
