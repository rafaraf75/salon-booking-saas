import { NextResponse } from "next/server";

import { createRouteSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type OpeningHourPayload = {
  weekday: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

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
    salon?: {
      name?: string;
      address?: string;
      phone?: string;
      email?: string;
      country?: string;
      currency?: Database["public"]["Enums"]["currency_code"] | string;
      locale?: Database["public"]["Enums"]["supported_locale"] | string;
    };
    workstationsCount?: number;
    openingHours?: OpeningHourPayload[];
  };

  const salon = body.salon || {};
  const workstationsCount = Math.min(Math.max(body.workstationsCount || 1, 1), 10);
  const openingHours = (body.openingHours || []).filter((oh) => oh && typeof oh.weekday === "number");

  // Znajdź lub utwórz salon przypisany do użytkownika
  const { data: existingSalon } = await supabase
    .from("salons")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  let salonId = existingSalon?.id;

  if (!salonId) {
    const { data: created, error: createError } = await supabase
      .from("salons")
      .insert({
        name: salon.name || "Mi Salón",
        address: salon.address,
        phone: salon.phone,
        email: salon.email ?? user.email,
        country: salon.country,
        currency: (salon.currency as any) || "EUR",
        default_locale: (salon.locale as any) || "es",
        owner_user_id: user.id,
      })
      .select("id")
      .maybeSingle();
    if (createError) {
      return NextResponse.json({ message: createError.message }, { status: 400 });
    }
    salonId = created?.id || undefined;
  } else {
    const { error: updateError } = await supabase
      .from("salons")
      .update({
        name: salon.name || "Mi Salón",
        address: salon.address,
        phone: salon.phone,
        email: salon.email ?? user.email,
        country: salon.country,
        currency: (salon.currency as any) || "EUR",
        default_locale: (salon.locale as any) || "es",
      })
      .eq("id", salonId);
    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 400 });
    }
  }

  if (!salonId) {
    return NextResponse.json({ message: "Brak salonu do konfiguracji" }, { status: 400 });
  }

  // Workstations: wyczyść i wstaw na nowo
  await supabase.from("workstations").delete().eq("salon_id", salonId);
  const workstationRows = Array.from({ length: workstationsCount }).map((_, idx) => ({
    salon_id: salonId,
    name: `Stanowisko ${idx + 1}`,
    order_index: idx,
  }));
  const { error: wsError } = await supabase.from("workstations").insert(workstationRows);
  if (wsError) {
    return NextResponse.json({ message: wsError.message }, { status: 400 });
  }

  // Opening hours: wyczyść i wstaw
  await supabase.from("opening_hours").delete().eq("salon_id", salonId);
  if (openingHours.length) {
    const openingRows = openingHours.map((oh) => ({
      salon_id: salonId,
      weekday: oh.weekday,
      open_time: oh.is_closed ? null : oh.open_time,
      close_time: oh.is_closed ? null : oh.close_time,
      is_closed: oh.is_closed,
    }));
    const { error: ohError } = await supabase.from("opening_hours").insert(openingRows);
    if (ohError) {
      return NextResponse.json({ message: ohError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true, salonId }, { status: 200 });
}
