"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ServiceFormData = {
  id?: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
};

export function ServiceForm({
  initial,
  onSubmit,
  onCancel,
  busy,
}: {
  initial?: Partial<ServiceFormData>;
  onSubmit: (data: ServiceFormData) => Promise<void> | void;
  onCancel?: () => void;
  busy?: boolean;
}) {
  const [form, setForm] = useState<ServiceFormData>({
    id: initial?.id,
    name: initial?.name || "",
    description: initial?.description || "",
    duration_minutes: initial?.duration_minutes || 30,
    price: initial?.price ?? 0,
    currency: initial?.currency || "EUR",
    is_active: initial?.is_active ?? true,
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.duration_minutes % 30 !== 0 || form.duration_minutes <= 0) {
      setError("Czas musi być wielokrotnością 30 minut.");
      return;
    }
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(err?.message ?? "Wystąpił błąd");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Nazwa</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Opis (opcjonalnie)</Label>
        <Input
          id="description"
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="duration">Czas (min)</Label>
          <Input
            id="duration"
            type="number"
            min={30}
            step={30}
            value={form.duration_minutes}
            onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Cena</Label>
          <Input
            id="price"
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Waluta</Label>
          <Input
            id="currency"
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="active"
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
        />
        <Label htmlFor="active" className="text-sm">
          Usługa aktywna
        </Label>
      </div>

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Anuluj
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Zapisywanie..." : "Zapisz"}
        </Button>
      </div>
    </form>
  );
}
