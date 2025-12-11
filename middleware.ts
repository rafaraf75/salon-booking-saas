import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

import type { Database } from "@/types/supabase";

const PROTECTED_SEGMENT = "/(app)/";
const DEFAULT_LOCALE = "es";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // Redirect root -> /es
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}`;
    return NextResponse.redirect(url);
  }

  // Jeśli brak env, pomijamy sprawdzanie supabase (dev bez konfiguracji)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return res;
  }

  const supabase = createMiddlewareClient<Database>({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAppRoute = pathname.includes(PROTECTED_SEGMENT);

  if (isAppRoute && !user) {
    const url = req.nextUrl.clone();
    const locale = pathname.split("/")[1] || DEFAULT_LOCALE;
    url.pathname = `/${locale}/(marketing)/auth`;
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
