"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OpeningHour = {
  weekday: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

const weekdayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  // unwrap params on client (App Router passes a promise in RSC context)
  const [resolvedParams] = useState(async () => params);
  const [locale, setLocale] = useState<string>("es");
  useMemo(() => {
    resolvedParams.then((p) => setLocale(p.locale));
  }, [resolvedParams]);

  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [salon, setSalon] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    country: "",
    currency: "EUR",
    locale: "es",
  });

  const [workstationsCount, setWorkstationsCount] = useState(3);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>(
    Array.from({ length: 7 }).map((_, idx) => ({
      weekday: idx,
      open_time: idx < 5 ? "09:00" : null,
      close_time: idx < 5 ? "18:00" : null,
      is_closed: idx >= 5,
    })),
  );

  const stepsTotal = 3;

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salon,
          workstationsCount,
          openingHours,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Nie udało się zapisać danych onboardingu.");
      }
      router.push(`/${locale}/(app)/calendar`);
    } catch (e: any) {
      setError(e.message ?? "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Onboarding salonu</CardTitle>
          <CardDescription>Krok {step} z {stepsTotal}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nazwa salonu</Label>
                <Input
                  id="name"
                  value={salon.name}
                  onChange={(e) => setSalon({ ...salon, name: e.target.value })}
                  placeholder="Mi Salón"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={salon.phone}
                  onChange={(e) => setSalon({ ...salon, phone: e.target.value })}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email kontaktowy</Label>
                <Input
                  id="email"
                  type="email"
                  value={salon.email}
                  onChange={(e) => setSalon({ ...salon, email: e.target.value })}
                  placeholder="kontakt@salon.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adres</Label>
                <Input
                  id="address"
                  value={salon.address}
                  onChange={(e) => setSalon({ ...salon, address: e.target.value })}
                  placeholder="Ulica, miasto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Kraj</Label>
                <Input
                  id="country"
                  value={salon.country}
                  onChange={(e) => setSalon({ ...salon, country: e.target.value })}
                  placeholder="Hiszpania / Polska"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Waluta</Label>
                <Input
                  id="currency"
                  value={salon.currency}
                  onChange={(e) => setSalon({ ...salon, currency: e.target.value })}
                  placeholder="EUR / PLN"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label htmlFor="workstations">Liczba stanowisk</Label>
              <Input
                id="workstations"
                type="number"
                min={1}
                max={10}
                value={workstationsCount}
                onChange={(e) => setWorkstationsCount(Number(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                Utworzymy stanowiska o nazwach Stanowisko 1..N (możesz je zmienić później).
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Godziny otwarcia w tygodniu (domyślnie 09:00-18:00 pn-pt, weekendy zamknięte).
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {openingHours.map((oh, idx) => (
                  <div key={oh.weekday} className="flex items-center gap-3 rounded-md border p-3">
                    <div className="w-12 text-sm font-semibold">{weekdayLabels[idx]}</div>
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        type="time"
                        value={oh.open_time ?? ""}
                        disabled={oh.is_closed}
                        onChange={(e) => {
                          const next = [...openingHours];
                          next[idx] = { ...oh, open_time: e.target.value };
                          setOpeningHours(next);
                        }}
                      />
                      <span className="text-sm text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={oh.close_time ?? ""}
                        disabled={oh.is_closed}
                        onChange={(e) => {
                          const next = [...openingHours];
                          next[idx] = { ...oh, close_time: e.target.value };
                          setOpeningHours(next);
                        }}
                      />
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={oh.is_closed}
                          onChange={(e) => {
                            const next = [...openingHours];
                            next[idx] = {
                              ...oh,
                              is_closed: e.target.checked,
                              open_time: e.target.checked ? null : oh.open_time ?? "09:00",
                              close_time: e.target.checked ? null : oh.close_time ?? "18:00",
                            };
                            setOpeningHours(next);
                          }}
                        />
                        Zamknięte
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="flex justify-between">
            <Button variant="outline" disabled={step === 1 || loading} onClick={() => setStep((s) => s - 1)}>
              Wstecz
            </Button>
            {step < stepsTotal ? (
              <Button disabled={loading} onClick={() => setStep((s) => s + 1)}>
                Dalej
              </Button>
            ) : (
              <Button disabled={loading} onClick={handleSubmit}>
                {loading ? "Zapisywanie..." : "Zakończ onboarding"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
