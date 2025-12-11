"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { formatISO } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  service_id: z.string().min(1, "Wybierz usługę"),
  client_name: z.string().min(1, "Wpisz imię klienta"),
  client_phone: z.string().optional(),
  client_email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type NewAppointmentFormValues = z.infer<typeof formSchema>;

type ServiceOption = {
  id: string;
  name: string;
  duration_minutes: number;
};

export function NewAppointmentForm({
  services,
  onSubmit,
  slotStart,
  workstationId,
  locale,
  busy,
}: {
  services: ServiceOption[];
  slotStart: string; // "HH:mm"
  workstationId: string;
  locale: string;
  busy?: boolean;
  onSubmit: (payload: {
    service_id: string;
    client_name: string;
    client_phone?: string;
    client_email?: string;
    notes?: string;
    start_at: string; // ISO
    workstation_id: string;
  }) => Promise<void> | void;
}) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<NewAppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_id: services[0]?.id ?? "",
      client_name: "",
      client_email: "",
      client_phone: "",
      notes: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setError(null);
    const dateStr = new Date().toISOString().slice(0, 10); // fallback if not provided outside
    try {
      await onSubmit({
        ...values,
        start_at: formatISO(new Date(`${dateStr}T${slotStart}:00`)),
        workstation_id: workstationId,
      });
      form.reset();
    } catch (e: any) {
      setError(e.message ?? "Nie udało się utworzyć wizyty");
    }
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="service">Usługa</Label>
        <select
          id="service"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          )}
          {...form.register("service_id")}
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.duration_minutes} min)
            </option>
          ))}
        </select>
        {form.formState.errors.service_id && (
          <p className="text-xs text-red-600">{form.formState.errors.service_id.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="client_name">Klient</Label>
        <Input id="client_name" {...form.register("client_name")} />
        {form.formState.errors.client_name && (
          <p className="text-xs text-red-600">{form.formState.errors.client_name.message}</p>
        )}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_phone">Telefon</Label>
          <Input id="client_phone" {...form.register("client_phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client_email">Email</Label>
          <Input id="client_email" type="email" {...form.register("client_email")} />
          {form.formState.errors.client_email && (
            <p className="text-xs text-red-600">{form.formState.errors.client_email.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Uwagi</Label>
        <Input id="notes" {...form.register("notes")} />
      </div>
      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "Zapisywanie..." : "Zapisz wizytę"}
      </Button>
    </form>
  );
}
