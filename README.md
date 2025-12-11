# Salon Booking SaaS (MVP)

Next.js (App Router, TypeScript) + Tailwind CSS + shadcn/ui + Supabase. Główny język UI: hiszpański z tłumaczeniami PL/EN. Pełne wymagania i kolejne zadania znajdziesz w `docs/Agent.md` oraz `docs/CodexTasks.md`.

## Szybki start

1. Skopiuj `.env.example` do `.env.local` i uzupełnij `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` oraz (tylko serwer) `SUPABASE_SERVICE_ROLE_KEY`.
2. Zainstaluj zależności: `yarn install` (przed pierwszym uruchomieniem usuń stare `node_modules`, jeśli istnieją po innej wersji Tailwinda).
3. Uruchom dev server: `yarn dev` i wejdź na `http://localhost:3000`.

### Supabase

- Zastosuj migracje SQL z `supabase/migrations` (najpierw `*_task02_*.sql`, potem `*_task03_*.sql`) w panelu Supabase lub przez CLI.
- Po migracjach schemat jest opisany w `types/supabase.ts`, a helpery klientów w `lib/supabase/*`.

## Przydatne skrypty

- `yarn dev` – tryb deweloperski.
- `yarn build` / `yarn start` – build produkcyjny i start serwera.
- `yarn lint` – lint (Next.js + ESLint + Prettier).
- `yarn format` – formatowanie kodu.

## Narzędzia deweloperskie

- Tailwind 3 + PostCSS, plugin `tailwindcss-animate`.
- shadcn/ui (Button, Card, Input, Dialog na start), `components.json` z aliasami `@/components`, `@/lib/utils`.
- Husky + lint-staged (pre-commit uruchamia lint/format).
- Supabase helpers w `lib/supabase` dla komponentów klienckich i serwerowych.

Więcej informacji o funkcjonalnościach i architekturze: `docs/Agent.md`.
