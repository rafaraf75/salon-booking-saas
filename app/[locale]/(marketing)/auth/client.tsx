"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseClient } from "@/lib/supabase/client";
import { type Locale } from "@/i18n/config";

type Mode = "signin" | "signup";

export function AuthForm({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Record<string, string>;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [salonName, setSalonName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;

        const response = await fetch("/api/salons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: salonName || "Mi Salón",
            email,
            locale,
          }),
        });
        if (!response.ok) {
          const { message } = await response.json().catch(() => ({ message: "Błąd serwera" }));
          throw new Error(message || "Nie udało się utworzyć salonu");
        }
      }

      router.push(`/${locale}/(app)/dashboard`);
    } catch (err: any) {
      setError(err.message ?? "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex gap-2">
        <Button
          variant={mode === "signin" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setMode("signin")}
          disabled={loading}
        >
          {dict["auth.login"]}
        </Button>
        <Button
          variant={mode === "signup" ? "default" : "outline"}
          className="flex-1"
          onClick={() => setMode("signup")}
          disabled={loading}
        >
          {dict["auth.register"]}
        </Button>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">{dict["auth.email"]}</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@salon.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{dict["auth.password"]}</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="salon">{dict["auth.salonName"]}</Label>
            <Input
              id="salon"
              placeholder="Mi Salón"
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
            />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? "Przetwarzanie..."
            : mode === "signin"
              ? dict["auth.login"]
              : dict["auth.register"]}
        </Button>
      </form>
    </>
  );
}
