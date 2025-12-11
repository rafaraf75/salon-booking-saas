import { NextResponse } from "next/server";
import { addMinutes, parseISO } from "date-fns";

import { sendAppointmentEmail } from "@/lib/notifications/email";
import { createRouteSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
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
    date?: string;
    start_at?: string; // HH:mm or ISO
    workstation_id?: string;
    status?: Database["public"]["Enums"]["appointment_status"];
  };

  if (!params.id) {
    return NextResponse.json({ message: "Brak ID wizyty" }, { status: 400 });
  }

  const { data: salon } = await supabase
    .from("salons")
    .select("id")
    .eq("owner_user_id", user.id)
    .maybeSingle();
  if (!salon?.id) {
    return NextResponse.json({ message: "Brak salonu" }, { status: 400 });
  }

  // Pobierz obecną wizytę
  const { data: current } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", params.id)
    .eq("salon_id", salon.id)
    .maybeSingle();
  if (!current) {
    return NextResponse.json({ message: "Wizyta nie istnieje" }, { status: 404 });
  }

  const serviceId = body.service_id || current.service_id;
  if (!serviceId) {
    return NextResponse.json({ message: "Brak usługi" }, { status: 400 });
  }

  const { data: service } = await supabase
    .from("services")
    .select("id, duration_minutes")
    .eq("id", serviceId)
    .eq("salon_id", salon.id)
    .maybeSingle();
  if (!service) {
    return NextResponse.json({ message: "Usługa nie istnieje" }, { status: 400 });
  }

  const date = body.date ?? current.start_at.slice(0, 10);
  const startAtIso = body.start_at
    ? body.start_at.includes("T")
      ? body.start_at
      : `${date}T${body.start_at}:00`
    : current.start_at;
  const startDate = parseISO(startAtIso);
  const endDate = addMinutes(startDate, service.duration_minutes);
  const workstationId = body.workstation_id || current.workstation_id;

  // Walidacja kolizji
  const { data: conflict } = await supabase
    .from("appointments")
    .select("id")
    .eq("workstation_id", workstationId)
    .eq("salon_id", salon.id)
    .neq("id", current.id)
    .or(
      `and(start_at.lte.${endDate.toISOString()},start_at.gte.${startDate.toISOString()}),and(start_at.lte.${startDate.toISOString()},start_at.gte.${startDate.toISOString()})`,
    )
    .limit(1)
    .maybeSingle();
  if (conflict?.id) {
    return NextResponse.json({ message: "Slot zajęty na tym stanowisku." }, { status: 409 });
  }

  const { error } = await supabase
    .from("appointments")
    .update({
      service_id: service.id,
      start_at: startDate.toISOString(),
      duration_minutes: service.duration_minutes,
      client_name: body.client_name ?? current.client_name,
      client_phone: body.client_phone ?? current.client_phone,
      client_email: body.client_email ?? current.client_email,
      status: (body.status as any) ?? current.status,
      notes: body.notes ?? current.notes,
      workstation_id: workstationId,
    })
    .eq("id", current.id);
  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (current.client_email) {
    const type: "updated" | "cancelled" =
      (body.status as any) === "cancelled" ? "cancelled" : "updated";
    sendAppointmentEmail(type, {
      to: current.client_email,
      clientName: body.client_name ?? current.client_name,
      serviceName: service.id,
      startAt: startDate.toISOString(),
      locale: (salon.default_locale as any) ?? "es",
    }).catch(() => null);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
