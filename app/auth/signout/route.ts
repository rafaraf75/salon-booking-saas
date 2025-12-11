import { NextResponse } from "next/server";

import { createRouteSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createRouteSupabaseClient();
  await supabase.auth.signOut();

  let locale = "es";
  try {
    const referer = request.headers.get("referer");
    if (referer) {
      const url = new URL(referer);
      const pathLocale = url.pathname.split("/").filter(Boolean)[0];
      if (pathLocale) {
        locale = pathLocale;
      }
    }
  } catch {
    // fallback es
  }

  return NextResponse.redirect(new URL(`/${locale}/(marketing)/auth`, request.url), {
    status: 302,
  });
}
