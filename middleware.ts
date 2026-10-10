import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Canonical-host enforcement: a single canonical origin for SEO.
  // www.mehfill.in -> https://mehfill.in (301, path + query preserved).
  // http -> https is forced by the platform (HSTS); this also upgrades any
  // plain-http request that reaches the app. Preview/localhost hosts pass through.
  const host = request.headers.get("host") ?? "";
  const hostname = host.split(":")[0].toLowerCase();
  if (hostname === "www.mehfill.in") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = "mehfill.in";
    return NextResponse.redirect(url, 301);
  }
  // NOTE: no http->https upgrade here — the platform (Vercel + HSTS) already
  // forces HTTPS. An x-forwarded-proto check causes infinite redirect loops
  // behind proxies that forward internal http with the header intact.
  // Skip entirely when Supabase isn't configured yet.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  await supabase.auth.getUser();
  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)"],
};
