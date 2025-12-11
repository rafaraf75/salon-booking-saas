"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Workstation = {
  id: string;
  name: string;
  order_index: number;
};

export default function WorkstationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [resolved] = useState(async () => params);
  const [locale, setLocale] = useState("es");
  useMemo(() => {
    resolved.then((p) => setLocale(p.locale));
  }, [resolved]);

  const [data, setData] = useState<Workstation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workstations");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Nie udało się pobrać stanowisk.");
      }
      const rows = (await res.json()) as Workstation[];
      setData(rows);
    } catch (e: any) {
      setError(e.message ?? "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const save = async (rows: Workstation[]) => {
    setError(null);
    const res = await fetch("/api/workstations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || "Nie udało się zapisać.");
    }
  };

  const handleRename = async (id: string, name: string) => {
    const next = data.map((w) => (w.id === id ? { ...w, name } : w));
    setData(next);
    try {
      await save(next);
    } catch (e: any) {
      setError(e.message ?? "Wystąpił błąd");
    }
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const next = [...data];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    // reassign order_index
    const reordered = next.map((w, idx) => ({ ...w, order_index: idx }));
    setData(reordered);
    try {
      await save(reordered);
    } catch (e: any) {
      setError(e.message ?? "Wystąpił błąd");
    }
  };

  const handleAdd = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/workstations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `Stanowisko ${data.length + 1}`, order_index: data.length }),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.message || "Nie udało się dodać stanowiska.");
      }
      fetchData();
    } catch (e: any) {
      setError(e.message ?? "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Stanowiska</CardTitle>
            <CardDescription>Zmień nazwy i kolejność stanowisk (krzeseł).</CardDescription>
          </div>
          <Button onClick={handleAdd} disabled={loading}>
            Dodaj stanowisko
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {loading ? (
            <p className="text-sm text-muted-foreground">Ładowanie...</p>
          ) : data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Brak stanowisk. Dodaj pierwsze.</p>
          ) : (
            <div className="space-y-2">
              {data
                .sort((a, b) => a.order_index - b.order_index)
                .map((w, idx) => (
                  <div
                    key={w.id}
                    className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <span className="text-xs text-muted-foreground w-10">#{idx + 1}</span>
                      <Input
                        value={w.name}
                        onChange={(e) => handleRename(w.id, e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleReorder(idx, -1)} disabled={idx === 0}>
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReorder(idx, 1)}
                        disabled={idx === data.length - 1}
                      >
                        ↓
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
