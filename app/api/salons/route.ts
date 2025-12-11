import { NextResponse } from "next/server";

import { createRouteSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export async function POST(req: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Brak autoryzacji" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    locale?: Database["public"]["Enums"]["supported_locale"];
  };

  const name = body.name?.trim() || "Mi Salón";
  const email = body.email?.trim() || user.email;
  const locale: Database["public"]["Enums"]["supported_locale"] = body.locale || "es";

  // Sprawdź, czy salon już istnieje
  const { data: existing } = await supabase
    .from("salons")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (existing?.id) {
    return NextResponse.json({ id: existing.id }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("salons")
    .insert({
      name,
      email,
      owner_user_id: user.id,
      default_locale: locale,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data?.id }, { status: 201 });
}
