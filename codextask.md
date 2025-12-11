# CodexTasks.md

> Każde zadanie ma: **Cel → Kroki → Pliki → Definition of Done**.  
> Język UI: **hiszpański jako główny**, z dokładnymi tłumaczeniami PL/EN w JSON.

---

## Task 00 – Bootstrap projektu

**Cel:** Utworzyć projekt Next.js z TypeScript, Tailwind, shadcn/ui.

**Kroki:**
1. Utwórz projekt: `pnpm` lub `npm create next-app@latest` (App Router, TypeScript).
2. Dodaj Tailwind + PostCSS; skonfiguruj `globals.css`.
3. Zainstaluj shadcn/ui i wygeneruj podstawowe komponenty (`Button`, `Card`, `Input`, `Dialog`).
4. Dodaj ESLint, Prettier, Husky, `lint-staged`.

**Pliki:**  
`package.json`, `app/layout.tsx`, `tailwind.config.ts`, `postcss.config.js`, `styles/globals.css`

**DoD:**  
Projekt buduje się; strona startowa renderuje; lint/format działa w pre-commit.

---

## Task 01 – Integracja z Supabase (client + env)

**Cel:** Podłączyć Supabase jako backend (auth + DB).

**Kroki:**
1. Utwórz projekt w Supabase, zanotuj `SUPABASE_URL` i `SUPABASE_ANON_KEY`.
2. Dodaj env (`.env.local`) i konfigurację klienta w `lib/supabase/client.ts`.
3. Dodaj prosty helper do używania klienta po stronie serwera/klienta (np. `createServerClient`).
4. Upewnij się, że env nie wyciekają do repo (gitignore).

**Pliki:**  
`.env.local`, `lib/supabase/client.ts`, ewentualnie `lib/supabase/server.ts`

**DoD:**  
Można wykonać prosty zapytanie `select 1` do Supabase z kodu Next.js.

---

## Task 02 – Schemat bazy danych (salon, stanowiska, usługi, wizyty)

**Cel:** Zdefiniować tabele w Supabase zgodne z wymaganiami.

**Kroki:**
1. Utwórz tabelę `salons`:
   - `id` (uuid, PK),
   - `owner_user_id` (powiązanie z auth),
   - `name`, `address`, `country`, `phone`, `email`,
   - `currency` (`EUR`/`PLN`),
   - `default_locale` (`es`, `pl`, `en`),
   - `created_at`, `updated_at`.
2. Utwórz tabelę `workstations`:
   - `id`, `salon_id` (FK),
   - `name` (np. „Stanowisko 1”),
   - `order_index` (kolejność),
   - `created_at`.
3. Utwórz tabelę `services`:
   - `id`, `salon_id` (FK),
   - `name`, `description`,
   - `duration_minutes` (wielokrotność 30),
   - `price`, `currency`,
   - `is_active`.
4. Utwórz tabelę `appointments`:
   - `id`, `salon_id`, `workstation_id`, `service_id`,
   - `start_at` (timestamp with time zone),
   - `duration_minutes`,
   - dane klienta: `client_name`, `client_phone`, `client_email`,
   - `status` (`scheduled`, `cancelled`, `completed`, `no_show`),
   - `notes`, `created_at`, `updated_at`.
5. Utwórz tabelę `closed_days`:
   - `id`, `salon_id`,
   - `date` (date),
   - `reason` (opcjonalnie).
6. Utwórz tabelę `opening_hours` (godziny otwarcia per dzień tygodnia):
   - `id`, `salon_id`,
   - `weekday` (0–6 lub nazwa),
   - `open_time`, `close_time` (np. `09:00`, `18:00`),
   - `is_closed` (bool).

**Pliki:**  
Supabase migrations / SQL (`supabase/migrations/*.sql` lub panel SQL w Supabase – ale zapisz wynikowy SQL).

**DoD:**  
Wszystkie tabele istnieją; można dodać przykładowy salon, usługę, stanowisko i wizytę.

---

## Task 03 – RLS i bezpieczeństwo

**Cel:** Ustawić Row Level Security tak, aby salon widział tylko swoje dane.

**Kroki:**
1. Włącz RLS na tabelach: `salons`, `workstations`, `services`, `appointments`, `closed_days`, `opening_hours`.
2. Dodaj polityki:
   - użytkownik może odczytywać/edyto­wać tylko rekordy powiązane z jego `salon_id` (na podstawie `auth.uid()` → `salons.owner_user_id`).
   - Salon może tworzyć rekordy z `salon_id` odpowiadającym jego salonowi.
3. Upewnij się, że `salons.owner_user_id` jest powiązane z identyfikatorem użytkownika z auth.

**Pliki:**  
Supabase policies (SQL).

**DoD:**  
Zapytanie z innym `user_id` nie zwraca danych innych salonów (test: 2 fikcyjnych userów, 2 salony).

---

## Task 04 – Auth i rejestracja salonu

**Cel:** Umożliwić rejestrację/logowanie właściciela i utworzenie rekordu `salon`.

**Kroki:**
1. Skonfiguruj Supabase Auth (e-mail + hasło).
2. Dodaj stronę logowania / rejestracji w segmencie `[locale]/(marketing)`:
   - formularz e-mail + hasło,
   - przełączanie między logowaniem i rejestracją.
3. Po rejestracji:
   - utwórz w DB rekord `salons` dla użytkownika (z domyślnymi danymi, currency / locale na podstawie kraju lub `es`/`EUR`).
4. Skonfiguruj `middleware` / ochronę routes dla `(app)`:
   - jeśli niezalogowany → redirect do logowania,
   - jeśli zalogowany, ale bez skonfigurowanego salonu → redirect do onboardingu.

**Pliki:**  
`app/[locale]/(marketing)/auth/page.tsx`, `lib/supabase/auth.ts`, `middleware.ts`

**DoD:**  
Nowy użytkownik może się zarejestrować, automatycznie tworzy się `salon`, po zalogowaniu trafia do onboardingu.

---

## Task 05 – i18n (ES/PL/EN, domyślnie ES)

**Cel:** Konfiguracja `next-intl` z trzema językami, domyślnie hiszpański.

**Kroki:**
1. Skonfiguruj segment `[locale]` z obsługą `es`, `pl`, `en`.
2. Dodaj pliki:
   - `locales/es.json`, `pl.json`, `en.json`.
3. Wypełnij podstawowe klucze (np. auth, nawigacja, kalendarz – minimalny zestaw) w **hiszpańskim**, a następnie dokładnie przetłumacz na PL i EN.
4. Dodaj middleware przekierowujące domyślnie na `/es`.
5. Zaimplementuj komponent `LangSwitcher` przełączający język.

**Pliki:**  
`middleware.ts`, `locales/*.json`, `app/[locale]/layout.tsx`, `components/common/LangSwitcher.tsx`

**DoD:**  
Adresy `/es`, `/pl`, `/en` działają; przełącznik zmienia język; domyślnie użytkownik ląduje na `/es`.

---

## Task 06 – Layout aplikacji (navbar/side + routing)

**Cel:** Stworzyć layout dla panelu salonu z nawigacją.

**Kroki:**
1. W segmencie `(app)` zbuduj layout z:
   - nagłówkiem (nazwa salonu, język, przycisk wylogowania),
   - bocznym menu z linkami: Dashboard, Kalendarz, Ustawienia.
2. Upewnij się, że layout jest responsywny (hamburger na mobile).
3. Dodaj placeholdery stron:
   - `/[locale]/(app)/dashboard`,
   - `/[locale]/(app)/calendar`,
   - `/[locale]/(app)/settings`.

**Pliki:**  
`app/[locale]/(app)/layout.tsx`, `components/common/Navbar.tsx`, `components/common/Sidebar.tsx`

**DoD:**  
Po zalogowaniu layout jest widoczny; nawigacja działa między trzema podstronami.

---

## Task 07 – Onboarding salonu (dane + stanowiska + godziny)

**Cel:** Przeprowadzić nowy salon przez konfigurację podstawową.

**Kroki:**
1. Utwórz stronę `/[locale]/(app)/onboarding` z kilkoma krokami:
   - Krok 1: dane salonu (nazwa, adres, kraj, telefon, e-mail, waluta).
   - Krok 2: liczba stanowisk (np. pole numeric) → utworzenie X rekordów w `workstations`.
   - Krok 3: godziny otwarcia (widok tygodnia, dla każdego dnia: od/do lub „zamknięte”).
2. Zapisuj dane do odpowiednich tabel (`salons`, `workstations`, `opening_hours`).
3. Po zakończeniu onboardingu redirect do `/[locale]/(app)/calendar`.

**Pliki:**  
`app/[locale]/(app)/onboarding/page.tsx`, komponenty formularzy w `components/forms/*`

**DoD:**  
Nowy salon po pierwszym logowaniu przechodzi onboarding; dane zapisują się w DB; po zakończeniu widzi kalendarz.

---

## Task 08 – Zarządzanie usługami salonu

**Cel:** Umożliwić salonowi dodawanie i edycję usług.

**Kroki:**
1. Utwórz stronę `/[locale]/(app)/settings/services`.
2. Lista istniejących usług (tabela/kafle).
3. Formularz dodawania/edycji usługi:
   - nazwa, opis, `duration_minutes`, `price`, `currency`, `is_active`.
   - walidacja: czas w wielokrotności 30 min (30, 60, 90…).
4. Akcje: dodaj, edytuj, deaktywuj (zamiast kasowania).

**Pliki:**  
`app/[locale]/(app)/settings/services/page.tsx`, `components/forms/ServiceForm.tsx`

**DoD:**  
Salon może skonfigurować listę usług; zapisy w DB działają; kalendarz może z nich korzystać (kolejne zadanie).

---

## Task 09 – Zarządzanie stanowiskami i dniami wolnymi

**Cel:** Ułatwić edycję stanowisk i dni zamkniętych.

**Kroki:**
1. Strona `/[locale]/(app)/settings/workstations`:
   - lista stanowisk,
   - możliwość zmiany nazwy i kolejności.
2. Strona `/[locale]/(app)/settings/schedule`:
   - edycja `opening_hours`,
   - sekcja „Dni zamknięte” → dodawanie dat do `closed_days`.
3. UI musi jasno pokazywać, w jakie dni salon jest zamknięty.

**Pliki:**  
`app/[locale]/(app)/settings/workstations/page.tsx`,  
`app/[locale]/(app)/settings/schedule/page.tsx`

**DoD:**  
Zmiana godzin / dni wolnych odświeża dane w DB; kolejne zadania kalendarza użyją tych ustawień.

---

## Task 10 – Generowanie slotów kalendarza (logika dat)

**Cel:** Napisać logikę generowania slotów 30-minutowych na podstawie godzin otwarcia i dni wolnych.

**Kroki:**
1. W `lib/dates/slots.ts` stwórz funkcję, która:
   - przyjmuje: datę, `opening_hours` salonu, listę `closed_days`,
   - zwraca listę slotów 30-minutowych (start time) w danym dniu.
2. Uwzględnij:
   - jeśli dzień jest w `closed_days` → zwróć pustą listę,
   - jeśli `is_closed` dla danego dnia tygodnia → pustą listę.
3. Dodaj testy jednostkowe lub prosty smoke (np. log w dev).

**Pliki:**  
`lib/dates/slots.ts`, ewentualnie testy w `lib/dates/slots.test.ts`

**DoD:**  
Dla przykładowych godzin (np. 09:00–18:00) funkcja zwraca poprawną listę slotów 30-minutowych.

---

## Task 11 – Widok kalendarza (UI dzienny)

**Cel:** Stworzyć widok kalendarza dziennego z kolumnami stanowisk i slotami.

**Kroki:**
1. Strona `/[locale]/(app)/calendar`:
   - picker daty,
   - przyciski „poprzedni dzień” / „następny dzień”,
   - wyróżnienie „dzisiaj”.
2. Pobierz:
   - `workstations` salonu,
   - `opening_hours`,
   - `closed_days`,
   - `appointments` dla danego dnia.
3. Użyj funkcji ze `slots.ts` do wygenerowania slotów.
4. Renderuj siatkę:
   - wiersze: sloty czasowe,
   - kolumny: stanowiska,
   - dla każdego slotu:
     - jeśli brak wizyty → slot pusty (klikalny),
     - jeśli jest wizyta → kafelek z nazwą klienta i usługą.

**Pliki:**  
`app/[locale]/(app)/calendar/page.tsx`, `components/calendar/DayView.tsx`, `components/calendar/TimeSlot.tsx`

**DoD:**  
Kalendarz pokazuje sloty dla wybranego dnia; wypełnione sloty odpowiadają wizytom z DB.

---

## Task 12 – Tworzenie wizyty (modal + walidacja konfliktów)

**Cel:** Umożliwić tworzenie wizyty z poziomu kalendarza z walidacją kolizji.

**Kroki:**
1. Po kliknięciu pustego slotu pokaż modal:
   - wybór usługi (select z `services`),
   - dane klienta: imię, telefon, e-mail,
   - pole uwagi (opcjonalne).
2. Oblicz `duration_minutes` na podstawie wybranej usługi.
3. Waliduj po stronie serwera:
   - przed insertem sprawdź, czy na danym `workstation_id` nie istnieje inna wizyta, która koliduje w zakresie czasu.
4. Zapisz wizytę w `appointments` z `status = scheduled`.

**Pliki:**  
`components/calendar/NewAppointmentModal.tsx`, endpoint / helper w `app/api/appointments/route.ts` lub server action

**DoD:**  
Salon może dodać wizytę; przy próbie nałożenia na inną wizytę otrzymuje czytelny błąd.

---

## Task 13 – Edycja i zmiana statusu wizyty

**Cel:** Umożliwić edycję istniejących wizyt.

**Kroki:**
1. Kliknięcie istniejącej wizyty otwiera modal szczegółów:
   - dane klienta, usługa, godzina, status, notatki.
2. Pozwól:
   - zmienić status (`scheduled` → `completed` / `cancelled` / `no_show`),
   - zmienić godzinę startu (przesunięcie wizyty),
   - zmienić usługę (a przez to czas trwania).
3. Przy zmianie startu / usługi ponownie waliduj kolizje.

**Pliki:**  
`components/calendar/AppointmentDetailsModal.tsx`, logika aktualizacji w API / server action

**DoD:**  
Wizyta może zostać zaktualizowana; kalendarz odświeża się poprawnie; kolizje są blokowane.

---

## Task 14 – E-maile potwierdzające wizyty

**Cel:** Wysłać e-mail do klienta po utworzeniu wizyty i przy zmianie statusu.

**Kroki:**
1. Dodaj prostą abstrakcję w `lib/notifications/email.ts`:
   - funkcja `sendAppointmentEmail(type: "created" | "updated" | "cancelled", data)`.
2. Wykorzystaj wybranego providera (np. Resend lub tymczasowy mock, ale API ma istnieć).
3. Zaprojektuj podstawowy szablon (HTML lub tekst) w **hiszpańskim**, z tłumaczeniem PL/EN:
   - teksty w plikach `locales/*.json` (np. sekcja `emails.appointment`).
4. Wywołuj `sendAppointmentEmail`:
   - po pomyślnym utworzeniu wizyty,
   - po zmianie statusu / terminu.

**Pliki:**  
`lib/notifications/email.ts`, ewentualnie `app/api/emails/route.ts`, wpisy w `locales/*.json`

**DoD:**  
Przy stworzeniu wizyty wysyła się e-mail (przynajmniej do sandboxa / loga w dev); brak błędów runtime.

---

## Task 15 – Subskrypcja i trial (prosta wersja)

**Cel:** Przygotować minimalny model subskrypcji: 1 miesiąc trial + status aktywny/nieaktywny.

**Kroki:**
1. Dodaj tabelę `subscriptions`:
   - `id`, `salon_id`,
   - `status` (`trial`, `active`, `expired`),
   - `trial_ends_at`, `current_period_end`,
   - `created_at`, `updated_at`.
2. Przy pierwszej rejestracji salonu:
   - utwórz subskrypcję z `status = trial` i `trial_ends_at = now() + 30 dni`.
3. Dodaj prosty middleware / guard:
   - jeśli `status = expired` → pokazuj ekran informujący o konieczności opłacenia planu (bez blokowania w dev na 100%, ale logika ma być).
4. (Opcjonalnie) Dodaj placeholder pod integrację z Stripe (bez pełnej integracji w tym momencie).

**Pliki:**  
Migracje Supabase, `lib/subscriptions.ts`, komponent widoku blokady (`components/subscription/Paywall.tsx`)

**DoD:**  
Nowy salon ma trial 30 dni; po ręcznym ustawieniu `expired` w DB aplikacja pokazuje ekran paywalla.

---

## Task 16 – UX/Styling kalendarza i responsywność

**Cel:** Uporządkować wygląd kalendarza i panelu, zadbać o mobile.

**Kroki:**
1. Użyj shadcn/ui + Tailwind do:
   - schludnego layoutu kalendarza,
   - czytelnych kafelków wizyt (kolory dla statusów).
2. Sprawdź widok na mobile:
   - np. przełączanie między stanowiskami na małych ekranach (tabs zamiast wielu kolumn).
3. Dodaj drobne animacje (Framer Motion) przy otwieraniu modalów.

**Pliki:**  
`components/calendar/*`, `styles/globals.css`, `styles/tokens.css`

**DoD:**  
Kalendarz wygląda czytelnie na desktopie i mobile; statusy są rozróżnialne kolorystycznie.

---

## Task 17 – Testy smoke (auth + kalendarz)

**Cel:** Podstawowa weryfikacja, że główne ścieżki działają.

**Kroki:**
1. Skonfiguruj Playwright.
2. Napisz testy:
   - rejestracja lub logowanie testowego salonu,
   - onboarding (przejście przez minimalną konfigurację),
   - wejście do kalendarza,
   - utworzenie wizyty,
   - sprawdzenie, że wizyta pojawia się w kalendarzu.

**Pliki:**  
`tests/auth-and-calendar.spec.ts`, konfiguracja Playwright

**DoD:**  
Testy przechodzą lokalnie; można je uruchomić jednym poleceniem.

---

## Task 18 – CI i deploy na Vercel

**Cel:** Automatyzacja buildu i wdrożenie.

**Kroki:**
1. Skonfiguruj GitHub Actions (lub inny CI) do:
   - instalacji deps,
   - lint,
   - build,
   - testów (opcjonalnie).
2. Podłącz repo do Vercel.
3. Skonfiguruj env w Vercel (Supabase, provider e-maili).
4. Dodaj `README.md` z:
   - instrukcją uruchomienia lokalnie,
   - info o i18n (ES/PL/EN),
   - info o Supabase.

**Pliki:**  
`.github/workflows/ci.yml`, `README.md`

**DoD:**  
Projekt jest online na Vercel; każdy PR/commit przechodzi CI.
