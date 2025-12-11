import { NextResponse } from "next/server";

import { createRouteSupabaseClient } from "@/lib/supabase/server";

type OpeningHourPayload = {
  id?: string;
  weekday: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

export async function PUT(req: Request) {
  const supabase = createRouteSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Brak autoryzacji" }, { status: 401 });
  }

  const rows = (await req.json().catch(() => [])) as OpeningHourPayload[];
  if (!Array.isArray(rows)) {
    return NextResponse.json({ message: "Nieprawidłowe dane" }, { status: 400 });
  }

  const { data: salon } = await supabase
    .from("salons")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!salon?.id) {
    return NextResponse.json({ message: "Brak salonu" }, { status: 400 });
  }

  // Wyczyść i wstaw nowe wiersze
  await supabase.from("opening_hours").delete().eq("salon_id", salon.id);
  const payload = rows.map((oh) => ({
    salon_id: salon.id,
    weekday: oh.weekday,
    open_time: oh.is_closed ? null : oh.open_time,
    close_time: oh.is_closed ? null : oh.close_time,
    is_closed: oh.is_closed,
  }));
  const { error } = await supabase.from("opening_hours").insert(payload);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
