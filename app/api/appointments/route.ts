import { NextResponse } from "next/server";
import { addMinutes, parseISO } from "date-fns";

import { createRouteSupabaseClient } from "@/lib/supabase/server";
import { sendAppointmentEmail } from "@/lib/notifications/email";
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
    service_id?: string;
    client_name?: string;
    client_phone?: string;
    client_email?: string;
    notes?: string;
    date?: string; // YYYY-MM-DD
    start_at?: string; // HH:mm or ISO
    workstation_id?: string;
  };

  if (!body.service_id || !body.client_name || !body.workstation_id || !body.start_at || !body.date) {
    return NextResponse.json({ message: "Brak wymaganych pól" }, { status: 400 });
  }

  const { data: salon } = await supabase
    .from("salons")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!salon?.id) {
    return NextResponse.json({ message: "Brak salonu" }, { status: 400 });
  }

  // Pobierz usługę, aby znać duration
  const { data: service } = await supabase
    .from("services")
    .select("id, duration_minutes")
    .eq("id", body.service_id)
    .eq("salon_id", salon.id)
    .maybeSingle();
  if (!service) {
    return NextResponse.json({ message: "Usługa nie istnieje" }, { status: 400 });
  }

  // Zbuduj pełną datę startu (ISO)
  const startAtIso = body.start_at.includes("T")
    ? body.start_at
    : `${body.date}T${body.start_at}:00`;
  const startDate = parseISO(startAtIso);
  const endDate = addMinutes(startDate, service.duration_minutes);

  // Walidacja kolizji: istnieje overlapping on workstation
  const { data: conflict } = await supabase
    .from("appointments")
    .select("id")
    .eq("workstation_id", body.workstation_id)
    .eq("salon_id", salon.id)
    .or(
      `and(start_at.lte.${endDate.toISOString()},start_at.gte.${startDate.toISOString()}),and(start_at.lte.${startDate.toISOString()},start_at.gte.${startDate.toISOString()})`,
    )
    .limit(1)
    .maybeSingle();

  if (conflict?.id) {
    return NextResponse.json({ message: "Slot zajęty na tym stanowisku." }, { status: 409 });
  }

  const { error } = await supabase.from("appointments").insert({
    salon_id: salon.id,
    workstation_id: body.workstation_id,
    service_id: service.id,
    start_at: startDate.toISOString(),
    duration_minutes: service.duration_minutes,
    client_name: body.client_name,
    client_phone: body.client_phone,
    client_email: body.client_email,
    status: "scheduled" as Database["public"]["Enums"]["appointment_status"],
    notes: body.notes ?? null,
  });
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (body.client_email) {
    sendAppointmentEmail("created", {
      to: body.client_email,
      clientName: body.client_name,
      serviceName: service.id,
      startAt: startDate.toISOString(),
      locale: (salon.default_locale as any) ?? "es",
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
