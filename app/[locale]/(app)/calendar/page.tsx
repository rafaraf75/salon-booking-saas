import { format, parseISO, startOfDay } from "date-fns";

import { DayView } from "@/components/calendar/day-view";
import { generateDailySlots } from "@/lib/dates/slots";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CalendarPage({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ locale: string }>;
}) {
  const [{ locale }, resolvedSearch] = await Promise.all([params, searchParams]);
  const date =
    typeof resolvedSearch?.date === "string" && resolvedSearch.date
      ? resolvedSearch.date
      : format(new Date(), "yyyy-MM-dd");

  let workstations: { id: string; name: string }[] = [];
  let openingHours: {
    weekday: number;
    open_time: string | null;
    close_time: string | null;
    is_closed: boolean;
  }[] = [];
  let closedDays: { date: string }[] = [];
  let appointments:
    | {
        id: string;
        workstation_id: string;
        start_at: string;
        duration_minutes: number;
        client_name: string | null;
        service_name: string | null;
      }[]
    | [] = [];

  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: salon } = await supabase
        .from("salons")
        .select("id")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (salon?.id) {
        const [wsRes, ohRes, cdRes] = await Promise.all([
          supabase
            .from("workstations")
            .select("id, name, order_index")
            .eq("salon_id", salon.id)
            .order("order_index"),
          supabase.from("opening_hours").select("*").eq("salon_id", salon.id),
          supabase.from("closed_days").select("*").eq("salon_id", salon.id),
        ]);
        workstations = wsRes.data?.map((w) => ({ id: w.id, name: w.name })) ?? [];
        openingHours =
          ohRes.data?.map((o) => ({
            weekday: o.weekday,
            open_time: o.open_time,
            close_time: o.close_time,
            is_closed: o.is_closed,
          })) ?? [];
        closedDays = cdRes.data?.map((c) => ({ date: c.date })) ?? [];

        const dayStart = startOfDay(parseISO(`${date}T00:00:00`)).toISOString();
        const dayEnd = startOfDay(parseISO(`${date}T00:00:00`)).setHours(23, 59, 59, 999);

        const { data: appts } = await supabase
          .from("appointments")
          .select("id, workstation_id, start_at, duration_minutes, client_name, service_id, status")
          .eq("salon_id", salon.id)
          .gte("start_at", dayStart)
          .lte("start_at", new Date(dayEnd).toISOString());
        const serviceIds = appts?.map((a) => a.service_id).filter(Boolean) as string[] | undefined;
        let servicesMap: Record<string, string> = {};
        if (serviceIds && serviceIds.length) {
          const { data: services } = await supabase
            .from("services")
            .select("id, name")
            .in("id", serviceIds);
          servicesMap = (services ?? []).reduce(
            (acc, s) => {
              acc[s.id] = s.name;
              return acc;
            },
            {} as Record<string, string>,
          );
        }
        appointments =
          appts?.map((a) => ({
            id: a.id,
            workstation_id: a.workstation_id,
            start_at: a.start_at,
            duration_minutes: a.duration_minutes,
            client_name: a.client_name,
            service_name: a.service_id ? servicesMap[a.service_id] : null,
          })) ?? [];
      }
    }
  } catch {
    // jeśli supabase/env brak, zostaw puste dane
  }

  const slots = generateDailySlots({ date, openingHours, closedDays });

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
      {slots.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Brak slotów dla tego dnia (zamknięte lub brak godzin otwarcia).
        </p>
      ) : (
        <DayView
          date={date}
          locale={locale}
          slots={slots}
          workstations={workstations}
          appointments={appointments}
        />
      )}
    </div>
  );
}
