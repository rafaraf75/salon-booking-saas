import { NextResponse } from "next/server";

import { createRouteSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type ServicePayload = {
  id?: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
};

export async function GET() {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Brak autoryzacji" }, { status: 401 });
  }

  // Pobierz salon użytkownika
  const { data: salon } = await supabase
    .from("salons")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!salon?.id) {
    return NextResponse.json([], { status: 200 });
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("salon_id", salon.id)
    .order("created_at", { ascending: true });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: Request) {
  return upsertService(req);
}

export async function PUT(req: Request) {
  return upsertService(req);
}

async function upsertService(req: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Brak autoryzacji" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as ServicePayload;
  if (!body.name || !body.duration_minutes || body.duration_minutes % 30 !== 0) {
    return NextResponse.json({ message: "Nieprawidłowe dane usługi" }, { status: 400 });
  }

  const { data: salon } = await supabase
    .from("salons")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!salon?.id) {
    return NextResponse.json({ message: "Brak salonu" }, { status: 400 });
  }

  const payload = {
    salon_id: salon.id,
    name: body.name,
    description: body.description ?? null,
    duration_minutes: body.duration_minutes,
    price: body.price ?? 0,
    currency: body.currency || "EUR",
    is_active: body.is_active ?? true,
  };

  if (body.id) {
    const { error } = await supabase
      .from("services")
      .update(payload)
      .eq("id", body.id)
      .eq("salon_id", salon.id);
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { error } = await supabase.from("services").insert(payload);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
