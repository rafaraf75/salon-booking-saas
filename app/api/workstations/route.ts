import { NextResponse } from "next/server";

import { createRouteSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Brak autoryzacji" }, { status: 401 });
  }

  const { data: salon } = await supabase
    .from("salons")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!salon?.id) {
    return NextResponse.json([], { status: 200 });
  }

  const { data, error } = await supabase
    .from("workstations")
    .select("*")
    .eq("salon_id", salon.id)
    .order("order_index", { ascending: true });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Brak autoryzacji" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as { name?: string; order_index?: number };
  const { data: salon } = await supabase
    .from("salons")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!salon?.id) {
    return NextResponse.json({ message: "Brak salonu" }, { status: 400 });
  }

  const { error } = await supabase.from("workstations").insert({
    salon_id: salon.id,
    name: body.name || "Stanowisko",
    order_index: body.order_index ?? 0,
  });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PUT(req: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Brak autoryzacji" }, { status: 401 });
  }

  const rows = (await req.json().catch(() => [])) as {
    id: string;
    name: string;
    order_index: number;
  }[];
  if (!Array.isArray(rows)) {
    return NextResponse.json({ message: "Nieprawidłowe dane" }, { status: 400 });
  }

  // Aktualizuj każdy rekord (prosto, bez transakcji)
  for (const row of rows) {
    const { error } = await supabase
      .from("workstations")
      .update({ name: row.name, order_index: row.order_index })
      .eq("id", row.id);
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
