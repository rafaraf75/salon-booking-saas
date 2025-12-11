"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { formatISO, parseISO } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  client_name: z.string().min(1, "Wpisz imię klienta"),
  client_phone: z.string().optional(),
  client_email: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
  service_id: z.string().min(1, "Wybierz usługę"),
  start_at: z.string().min(1, "Wybierz godzinę"),
  status: z.enum(["scheduled", "cancelled", "completed", "no_show"]),
});

export type AppointmentDetailsFormValues = z.infer<typeof formSchema>;

type ServiceOption = {
  id: string;
  name: string;
  duration_minutes: number;
};

export function AppointmentDetails({
  appointmentId,
  date,
  initial,
  services,
  onSubmit,
  onCancel,
}: {
  appointmentId: string;
  date: string;
  initial: AppointmentDetailsFormValues;
  services: ServiceOption[];
  onSubmit: (data: AppointmentDetailsFormValues) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const form = useForm<AppointmentDetailsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initial,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      await onSubmit({
        ...values,
        start_at: values.start_at.includes("T")
          ? values.start_at
          : formatISO(parseISO(`${date}T${values.start_at}:00`)),
      });
    } catch (e: any) {
      setError(e.message ?? "Nie udało się zapisać zmian");
    }
  });

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client_name">Klient</Label>
          <Input id="client_name" {...form.register("client_name")} />
          {form.formState.errors.client_name && (
            <p className="text-xs text-red-600">{form.formState.errors.client_name.message}</p>
          )}
        </div>
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
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            {...form.register("status")}
          >
            <option value="scheduled">scheduled</option>
            <option value="completed">completed</option>
            <option value="cancelled">cancelled</option>
            <option value="no_show">no_show</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service_id">Usługa</Label>
        <select
          id="service_id"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
        <Label htmlFor="start_at">Godzina startu</Label>
        <Input id="start_at" type="time" {...form.register("start_at")} />
        {form.formState.errors.start_at && (
          <p className="text-xs text-red-600">{form.formState.errors.start_at.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Uwagi</Label>
        <Input id="notes" {...form.register("notes")} />
      </div>

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        )}
        <Button type="submit">Zapisz</Button>
      </div>
    </form>
  );
}
