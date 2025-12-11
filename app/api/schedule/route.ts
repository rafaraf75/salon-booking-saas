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
    return NextResponse.json({ openingHours: [], closedDays: [] }, { status: 200 });
  }

  const { data: openingHours } = await supabase
    .from("opening_hours")
    .select("*")
    .eq("salon_id", salon.id)
    .order("weekday", { ascending: true });
  const { data: closedDays } = await supabase
    .from("closed_days")
    .select("*")
    .eq("salon_id", salon.id)
    .order("date", { ascending: true });

  return NextResponse.json({ openingHours: openingHours ?? [], closedDays: closedDays ?? [] }, { status: 200 });
}
