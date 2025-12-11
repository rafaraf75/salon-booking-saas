"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type OpeningHour = {
  id?: string;
  weekday: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

type ClosedDay = {
  id: string;
  date: string;
  reason: string | null;
};

const weekdayLabels = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];

export default function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [resolved] = useState(async () => params);
  const [locale, setLocale] = useState("es");
  useMemo(() => {
    resolved.then((p) => setLocale(p.locale));
  }, [resolved]);

  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [closedDays, setClosedDays] = useState<ClosedDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newClosedDate, setNewClosedDate] = useState("");
  const [newClosedReason, setNewClosedReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/schedule");
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || "Nie udało się pobrać harmonogramu.");
      }
      const { openingHours, closedDays } = (await res.json()) as {
        openingHours: OpeningHour[];
        closedDays: ClosedDay[];
      };
      setOpeningHours(openingHours);
      setClosedDays(closedDays);
    } catch (e: any) {
      setError(e.message ?? "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveOpening = async (rows: OpeningHour[]) => {
    const res = await fetch("/api/schedule/opening-hours", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      throw new Error(b.message || "Nie udało się zapisać godzin otwarcia.");
    }
  };

  const toggleClosed = async (idx: number, checked: boolean) => {
    const next = [...openingHours];
    next[idx] = {
      ...next[idx],
      is_closed: checked,
      open_time: checked ? null : next[idx].open_time ?? "09:00",
      close_time: checked ? null : next[idx].close_time ?? "18:00",
    };
    setOpeningHours(next);
    try {
      await saveOpening(next);
    } catch (e: any) {
      setError(e.message ?? "Wystąpił błąd");
    }
  };

  const updateTime = async (idx: number, key: "open_time" | "close_time", value: string) => {
    const next = [...openingHours];
    next[idx] = { ...next[idx], [key]: value };
    setOpeningHours(next);
    try {
      await saveOpening(next);
    } catch (e: any) {
      setError(e.message ?? "Wystąpił błąd");
    }
  };

  const addClosedDay = async () => {
    if (!newClosedDate) return;
    setError(null);
    const res = await fetch("/api/schedule/closed-days", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: newClosedDate, reason: newClosedReason }),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.message || "Nie udało się dodać dnia zamkniętego.");
      return;
    }
    setNewClosedDate("");
    setNewClosedReason("");
    fetchData();
  };

  const removeClosedDay = async (id: string) => {
    setError(null);
    const res = await fetch("/api/schedule/closed-days", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.message || "Nie udało się usunąć dnia.");
      return;
    }
    fetchData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Godziny otwarcia</CardTitle>
          <CardDescription>Ustaw godziny otwarcia na każdy dzień tygodnia.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {loading ? (
            <p className="text-sm text-muted-foreground">Ładowanie...</p>
          ) : (
            <div className="space-y-2">
              {openingHours
                .sort((a, b) => a.weekday - b.weekday)
                .map((oh, idx) => (
                  <div
                    key={oh.weekday}
                    className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="text-sm font-semibold w-16">{weekdayLabels[oh.weekday] ?? `Dzień ${oh.weekday}`}</div>
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        type="time"
                        value={oh.open_time ?? ""}
                        disabled={oh.is_closed}
                        onChange={(e) => updateTime(idx, "open_time", e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={oh.close_time ?? ""}
                        disabled={oh.is_closed}
                        onChange={(e) => updateTime(idx, "close_time", e.target.value)}
                      />
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={oh.is_closed}
                          onChange={(e) => toggleClosed(idx, e.target.checked)}
                        />
                        Zamknięte
                      </label>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dni zamknięte</CardTitle>
          <CardDescription>Dodaj konkretne daty, gdy salon jest nieczynny.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              type="date"
              value={newClosedDate}
              onChange={(e) => setNewClosedDate(e.target.value)}
              className="sm:max-w-xs"
            />
            <Input
              placeholder="Powód (opcjonalnie)"
              value={newClosedReason}
              onChange={(e) => setNewClosedReason(e.target.value)}
            />
            <Button onClick={addClosedDay}>Dodaj dzień</Button>
          </div>
          <div className="space-y-2">
            {closedDays.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak dni zamkniętych.</p>
            ) : (
              closedDays.map((cd) => (
                <div
                  key={cd.id}
                  className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="text-sm">
                    <span className="font-semibold">{cd.date}</span>
                    {cd.reason ? ` • ${cd.reason}` : ""}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => removeClosedDay(cd.id)}>
                    Usuń
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
