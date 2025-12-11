import { NextResponse } from "next/server";

import { createRouteSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Brak autoryzacji" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { date?: string; reason?: string };
  if (!body.date) {
    return NextResponse.json({ message: "Brak daty" }, { status: 400 });
  }

  const { data: salon } = await supabase
    .from("salons")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!salon?.id) {
    return NextResponse.json({ message: "Brak salonu" }, { status: 400 });
  }

  const { error } = await supabase.from("closed_days").insert({
    salon_id: salon.id,
    date: body.date,
    reason: body.reason ?? null,
  });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Brak autoryzacji" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ message: "Brak id" }, { status: 400 });
  }

  const { data: salon } = await supabase
    .from("salons")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!salon?.id) {
    return NextResponse.json({ message: "Brak salonu" }, { status: 400 });
  }

  const { error } = await supabase
    .from("closed_days")
    .delete()
    .eq("id", body.id)
    .eq("salon_id", salon.id);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
