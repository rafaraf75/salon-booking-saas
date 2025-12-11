"use client";

import Link from "next/link";
import { addDays, format, parseISO } from "date-fns";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { NewAppointmentForm } from "./new-appointment-form";

type Workstation = { id: string; name: string };
type Appointment = {
  id: string;
  workstation_id: string;
  start_at: string; // ISO
  duration_minutes: number;
  client_name: string | null;
  service_name: string | null;
  service_id?: string | null;
  status?: string | null;
};

export function DayView({
  date,
  locale,
  slots,
  workstations,
  appointments,
  services,
  onCreated,
  onUpdated,
}: {
  date: string;
  locale: string;
  slots: string[];
  workstations: Workstation[];
  appointments: Appointment[];
  services: { id: string; name: string; duration_minutes: number }[];
  onCreated?: () => void;
  onUpdated?: () => void;
}) {
  const apptMap = useMemo(() => {
    const map = new Map<string, Appointment>();
    appointments.forEach((a) => {
      const key = `${a.workstation_id}-${format(parseISO(a.start_at), "HH:mm")}`;
      map.set(key, a);
    });
    return map;
  }, [appointments]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedWorkstation, setSelectedWorkstation] = useState<string | null>(null);
  const [editing, setEditing] = useState<Appointment | null>(null);

  const dateObj = parseISO(date);
  const prevDate = format(addDays(dateObj, -1), "yyyy-MM-dd");
  const nextDate = format(addDays(dateObj, 1), "yyyy-MM-dd");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/${locale}/(app)/calendar?date=${prevDate}`}
            className="rounded-md border px-3 py-1"
          >
            ← Poprzedni
          </Link>
          <span className="text-base font-semibold text-foreground">{date}</span>
          <Link
            href={`/${locale}/(app)/calendar?date=${nextDate}`}
            className="rounded-md border px-3 py-1"
          >
            Następny →
          </Link>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/${locale}/(app)/calendar`}>Dzisiaj</Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `140px repeat(${workstations.length}, minmax(180px, 1fr))`,
          }}
        >
          <div className="sticky left-0 z-10 border-b bg-muted/60 p-2 text-sm font-semibold">
            Czas
          </div>
          {workstations.map((w) => (
            <div
              key={w.id}
              className="border-b border-l bg-muted/60 p-2 text-sm font-semibold"
            >
              {w.name}
            </div>
          ))}
          {slots.map((slot) => (
            <>
              <div
                key={`time-${slot}`}
                className="sticky left-0 border-b bg-background p-2 text-xs font-semibold text-muted-foreground"
              >
                {slot}
              </div>
              {workstations.map((w) => {
                const appt = apptMap.get(`${w.id}-${slot}`);
                const openNew = () => {
                  setSelectedSlot(slot);
                  setSelectedWorkstation(w.id);
                  setEditing(null);
                  setDialogOpen(true);
                };
                const openEdit = (appointment: Appointment) => {
                  setEditing(appointment);
                  setSelectedSlot(slot);
                  setSelectedWorkstation(w.id);
                  setDialogOpen(true);
                };
                return (
                  <div
                    key={`${w.id}-${slot}`}
                    className={cn(
                      "border-b border-l p-2 text-xs",
                      appt ? "bg-orange-50" : "bg-white hover:bg-accent cursor-pointer",
                    )}
                    onClick={!appt ? openNew : () => openEdit(appt)}
                  >
                    {appt ? (
                      <div className="rounded-md border border-orange-200 bg-orange-100 px-2 py-1">
                        <div className="font-semibold text-orange-900">
                          {appt.client_name || "Wizyta"}
                        </div>
                        <div className="text-[11px] text-orange-800">
                          {appt.service_name || "Usługa"} • {slot} ({appt.duration_minutes} min)
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Dodaj</span>
                    )}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nowa wizyta</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {date} • {selectedSlot || "—"}
          </div>
          {selectedSlot && selectedWorkstation ? (
            editing ? (
              <AppointmentDetails
                appointmentId={editing.id}
                date={date}
                services={services}
                initial={{
                  client_name: editing.client_name || "",
                  client_phone: "",
                  client_email: "",
                  notes: "",
                  service_id: editing.service_id || services[0]?.id || "",
                  start_at: selectedSlot,
                  status: (editing.status as any) || "scheduled",
                }}
                onSubmit={async (payload) => {
                  await fetch("/api/appointments", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      appointment_id: editing.id,
                      ...payload,
                      date,
                      workstation_id: selectedWorkstation,
                    }),
                  }).then(async (res) => {
                    if (!res.ok) {
                      const b = await res.json().catch(() => ({}));
                      throw new Error(b.message || "Nie udało się zaktualizować wizyty.");
                    }
                  });
                  setDialogOpen(false);
                  setEditing(null);
                  onUpdated?.();
                }}
                onCancel={() => setDialogOpen(false)}
              />
            ) : (
              <NewAppointmentForm
                services={services}
                slotStart={selectedSlot}
                workstationId={selectedWorkstation}
                locale={locale}
                onSubmit={async (payload) => {
                  await fetch("/api/appointments", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...payload,
                      date,
                    }),
                  }).then(async (res) => {
                    if (!res.ok) {
                      const b = await res.json().catch(() => ({}));
                      throw new Error(b.message || "Nie udało się utworzyć wizyty.");
                    }
                  });
                  setDialogOpen(false);
                  onCreated?.();
                }}
              />
            )
          ) : (
            <p className="text-sm text-muted-foreground">Wybierz slot, aby dodać wizytę.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
