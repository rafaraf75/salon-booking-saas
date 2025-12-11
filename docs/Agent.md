# Agent.md

## 0) Cel projektu

Zbudować nowoczesną, wielojęzyczną aplikację **SaaS do zarządzania wizytami w salonach fryzjerskich**.

Główne funkcje:
- panel dla **salonu** z kalendarzem opartym na **kafelkach czasowych (slot 30 min)**,
- konfiguracja **stanowisk** (krzeseł), **usług** (strzyżenie, farbowanie itd.) i **godzin otwarcia**,
- dodawanie i edycja **wizyt** z danymi klienta,
- zarządzanie **dniami wolnymi** / zamkniętymi,
- podstawy **powiadomień e-mail** (potwierdzenia / zmiany wizyt).

Główny język interfejsu: **hiszpański (ES)**, z pełnymi tłumaczeniami na **polski (PL)** i **angielski (EN)**.

Docelowo:
- integracja z **SMS/WhatsApp**,
- API / widoki dla **klientów** (rezerwacja online z zewnątrz),
- gotowość pod integrację z np. **Google Maps / Bookings**.

---

## 1) Stack i narzędzia

- **Framework:** Next.js (App Router, TypeScript)
- **Styling/UI:** Tailwind CSS + shadcn/ui (tylko potrzebne komponenty)
- **Stan / dane:** React Query / TanStack Query (fetch + cache), prosty lokalny state (np. Zustand) opcjonalny
- **Animacje:** Framer Motion (lekkie animacje wejścia, hover, micro-interactions)
- **i18n:** `next-intl` z segmentem `[locale]` i językami: `es` (domyślny), `pl`, `en`
- **Auth + DB:** Supabase (Postgres, RLS, auth e-mail/password)
- **Walidacja:** `zod` + `react-hook-form` dla formularzy
- **Daty / czas:** `date-fns` (strefy czasowe, formatowanie, operacje na slotach 30 min)
- **E-maile (MVP):** prosty provider (np. Resend / inny) lub mail testowy przez własny endpoint
- **Jakość:** ESLint, Prettier, Husky + lint-staged
- **Testy (light):** Playwright (smoke dla logowania, kalendarza, tworzenia wizyty)
- **Deploy:** Vercel

---

## 2) Zakres MVP (funkcje)

### 2.1 Użytkownik / model SaaS

- **1 konto SaaS = 1 salon**.
- Jeden **właściciel salonu** (jedno konto / login).
- Brak osobnych kont dla fryzjerów w MVP – tylko **stanowiska** jako sloty (np. „Stanowisko 1”, „Stanowisko 2”, „Stanowisko 3”).

### 2.2 Onboarding salonu (pierwsza konfiguracja)

Po rejestracji / pierwszym logowaniu:

1. Formularz podstawowych danych salonu:
   - nazwa, adres, kraj (ważne dla waluty), telefon, e-mail kontaktowy.
2. Konfiguracja **liczby stanowisk**:
   - np. 1–10, tworzone jako „Stanowisko 1”, „Stanowisko 2” itd. (z możliwością zmiany nazwy).
3. Ustawienie **godzin otwarcia**:
   - dla każdego dnia tygodnia: od / do albo „zamknięte”.
   - zapis w bazie per dzień: np. `monday_open`, `monday_close`, `is_monday_closed`.
4. Dodanie **usług**:
   - nazwa usługi,
   - domyślny czas trwania (w minutach, wielokrotność 30 min),
   - cena (w walucie przypisanej do salonu),
   - opis (opcjonalnie).

Konfiguracja musi być edytowalna później w **Ustawieniach salonu**.

### 2.3 Kalendarz salonu (główny widok)

- Widok **dzienny** jako MVP:
  - oś pionowa: godziny (sloty co 30 min),
  - kolumny poziome: **stanowiska**.
- Wyróżniony **bieżący dzień** (np. pogrubiona karta / inny kolor).
- Nawigacja po dniach: **poprzedni / następny dzień**, wybór daty z date-pickera.
- **Kafelki**:
  - pusty slot → po kliknięciu formularz dodania wizyty,
  - zajęty slot → po kliknięciu otwiera się karta wizyty (szczegóły + akcje).

Slot bazowy: **30 minut**.  
Czas trwania wizyty = suma slotów 30-minutowych na podstawie czasu usługi.

### 2.4 Wizyty

Dla każdej wizyty przechowujemy:

- powiązanie: salon, stanowisko, usługa,
- **data + godzina startu**,
- **czas trwania** (w minutach),
- dane klienta:
  - imię,
  - telefon,
  - e-mail,
- **status** wizyty:
  - `scheduled` (zaplanowana),
  - `cancelled` (odwołana),
  - `completed` (zrealizowana),
  - `no_show` (klient nie przyszedł),
- ewentualne **uwagi** (np. „farbowanie na blond”).

Zasady:
- Na danym **stanowisku** nie może być dwóch wizyt w tym samym czasie (walidacja przy tworzeniu / edycji).
- Salon może:
  - zmienić termin,
  - zmienić usługę,
  - zmienić status,
  - edytować dane klienta.

### 2.5 Dni wolne / zamknięte

- Możliwość oznaczenia **konkretnych dni** jako:
  - „Salon zamknięty” (wszystkie stanowiska niedostępne).
- W kalendarzu:
  - dzień oznaczony jako nieczynny → wszystkie sloty blokowane / niewidoczne dla wizyt.

### 2.6 Powiadomienia

MVP:

- **E-mail do klienta**:
  - przy utworzeniu wizyty (potwierdzenie),
  - przy zmianie terminu / statusu (np. odwołanie).
- Model:
  - szablony e-maili przygotowane w **hiszpańskim**, z tłumaczeniami na PL/EN (na podstawie języka salonu albo języka klienta w przyszłości).

Przyszłość (po MVP, ale przewidziane w architekturze):

- **SMS / WhatsApp**:
  - przypomnienie o wizycie (np. dzień wcześniej),
  - informacja o zmianie / odwołaniu.
- Integracja z zewnętrznym providerem (Twilio, WhatsApp Business API lub inny).

### 2.7 Języki i waluty

- UI i treści:
  - **ES (domyślny)**, PL, EN.
- Waluty:
  - co najmniej **EUR** i **PLN**:
    - np. Hiszpania → domyślnie EUR,
    - Polska → domyślnie PLN,
    - przechowywane w konfiguracji salonu (pole `currency`).

---

## 3) Zasady projektowe (dla AI i ludzi)

- **Wydajność:** szybkie ładowanie kalendarza, lazy-load cięższych modułów.
- **Dostępność (a11y):** odpowiednie aria-labels, fokus na modale (formularze wizyt).
- **Responsywność:** mobile-first; kalendarz musi działać dobrze na tabletach.
- **Kod:** TypeScript, bez `any`; separacja logiki (hooks, lib) od komponentów prezentacyjnych.
- **i18n:** wszystkie stringi w `locales/*.json`; **główny język: hiszpański**, polskie i angielskie tłumaczenia dokładne, nie dosłownie „po Google”.
- **UX:** minimalnie skomplikowany flow; salon musi móc dodać wizytę w 2–3 kliknięciach.
- **Bezpieczeństwo:** RLS w Supabase – salon widzi tylko swoje dane.

---

## 4) Architektura i struktura katalogów (docelowa)

```txt
app/
  [locale]/              # es (domyślny), pl, en
    (marketing)/
      page.tsx          # prosty landing / opis apki
      pricing/page.tsx  # info o trialu i subskrypcji (placeholder)
    (app)/
      layout.tsx        # layout dla zalogowanego salonu
      dashboard/page.tsx      # skrót dnia, szybkie akcje
      calendar/page.tsx       # główny widok kalendarza
      settings/
        page.tsx              # ustawienia ogólne salonu
        services/page.tsx     # lista usług
        workstations/page.tsx # stanowiska (krzesła)
        schedule/page.tsx     # godziny otwarcia, dni wolne
  api/
    webhooks/stripe/route.ts  # (opcjonalnie, później) płatności
    emails/route.ts           # endpoint do wysyłki maili (MVP)
components/
  ui/             # shadcn
  common/         # Navbar, Sidebar, LangSwitcher, etc.
  calendar/       # komponenty kalendarza, sloty, modale wizyt
  forms/          # formularze reużywalne
lib/
  supabase/       # klient, helpery auth
  i18n/           # helpery next-intl
  dates/          # generowanie slotów 30 min, operacje na datach
  validation/     # schematy zod
  notifications/  # warstwa abstrakcji do e-mail/SMS
styles/
  globals.css
  tokens.css
locales/
  es.json
  pl.json
  en.json
```

---

## 5) Wskazówki dla AI (ważne)

- Zawsze zakładaj **slot bazowy 30 min**.
- Waliduj konflikty wizyt po stronie serwera (Supabase):  
  nie tworzyć wizyty, jeśli istnieje inna w tym samym czasie na tym samym stanowisku.
- Kalendarz:
  - generuj sloty na podstawie godzin otwarcia salonu dla danego dnia,
  - uwzględniaj dni oznaczone jako „zamknięte”.
- **i18n:** klucze neutralne (`"calendar.today"`, `"appointments.new"`, itd.); wartości:
  - najpierw poprawne hiszpańskie,
  - potem dokładne tłumaczenia PL i EN.
- Nie zapisuj na stałe tekstów w komponentach – wszystko z plików `locales/*.json`.
- W komponentach kalendarza separuj:
  - logikę generowania slotów (hooks / lib),
  - widok (komponenty UI).

---

## 6) Definition of Done (globalne)

- Projekt buduje się bez błędów; ESLint/Prettier przechodzą.
- Rejestracja i logowanie salonu działają (Supabase auth).
- Onboarding salonu (dane, stanowiska, usługi, godziny otwarcia) działa end-to-end.
- Kalendarz:
  - pokazuje poprawne sloty dla wybranego dnia,
  - umożliwia tworzenie, edycję i zmianę statusu wizyty,
  - blokuje podwójne rezerwacje na jednym stanowisku.
- Min. 1 szablon e-mail (potwierdzenie wizyty) wysyłany jest poprawnie.
- i18n:
  - aplikacja działa w ES/PL/EN,
  - domyślne przekierowanie na **ES**,
  - klucze są spójne we wszystkich językach.
- RLS: salon nie widzi danych innych salonów (testy kontrolne).
- Responsywność: kalendarz i konfiguracja salonu używalne na ekranach mobilnych i desktopowych.

---

## 7) Out of scope (MVP)

- Osobne loginy dla pracowników / fryzjerów (role userów).
- Pełna aplikacja mobilna (native).
- Integracja z Google Maps / zewnętrznymi marketplace’ami rezerwacji.
- Zaawansowane zarządzanie subskrypcjami (kilka planów, add-ony).
- Pełna integracja SMS/WhatsApp (może być tylko częściowo zaprojektowana).
