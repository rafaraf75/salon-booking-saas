"use client";

import { useEffect, useMemo, useState } from "react";

import { ServiceForm, type ServiceFormData } from "@/components/forms/service-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
};

export default function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [resolved] = useState(async () => params);
  const [locale, setLocale] = useState("es");
  useMemo(() => {
    resolved.then((p) => setLocale(p.locale));
  }, [resolved]);

  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/services");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Nie udało się pobrać usług.");
      }
      const data = (await res.json()) as ServiceRow[];
      setServices(data);
    } catch (e: any) {
      setError(e.message ?? "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (payload: ServiceFormData) => {
    setError(null);
    const res = await fetch("/api/services", {
      method: payload.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Nie udało się zapisać usługi.");
    }
    setDialogOpen(false);
    setEditing(null);
    fetchServices();
  };

  const toggleActive = async (svc: ServiceRow) => {
    setError(null);
    const res = await fetch("/api/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...svc, is_active: !svc.is_active }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Nie udało się zmienić statusu.");
      return;
    }
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Usługi</CardTitle>
            <CardDescription>Zarządzaj listą usług salonu.</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditing(null);
                  setDialogOpen(true);
                }}
              >
                Dodaj usługę
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edytuj usługę" : "Nowa usługa"}</DialogTitle>
                <DialogDescription>Wprowadź dane usługi. Czas w wielokrotności 30 min.</DialogDescription>
              </DialogHeader>
              <ServiceForm
                initial={editing ?? undefined}
                onSubmit={handleSubmit}
                onCancel={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {loading ? (
            <p className="text-sm text-muted-foreground">Ładowanie...</p>
          ) : services.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak usług. Dodaj pierwszą usługę.</p>
          ) : (
            <div className="divide-y rounded-md border">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className={cn(
                    "flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between",
                    !svc.is_active && "opacity-60",
                  )}
                >
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">{svc.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {svc.duration_minutes} min • {svc.price.toFixed(2)} {svc.currency}
                      {svc.description ? ` • ${svc.description}` : ""}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditing(svc); setDialogOpen(true); }}>
                      Edytuj
                    </Button>
                    <Button
                      variant={svc.is_active ? "secondary" : "default"}
                      size="sm"
                      onClick={() => toggleActive(svc)}
                    >
                      {svc.is_active ? "Deaktywuj" : "Aktywuj"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
