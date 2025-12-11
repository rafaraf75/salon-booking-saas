import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LangSwitcher } from "@/components/common/lang-switcher";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function MarketingHome({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const features = [
    dict["marketing.feature1"],
    dict["marketing.feature2"],
    dict["marketing.feature3"],
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50/60 via-white to-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-start lg:gap-10 lg:px-10">
        <section className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-100 px-4 py-1 text-sm font-medium text-orange-900">
              {dict["marketing.tagline"]}
            </div>
            <LangSwitcher currentLocale={locale} pathname={`/${locale}`} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-[1.1] text-gray-900 sm:text-5xl">
              {dict["marketing.heroTitle"]}
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">{dict["marketing.heroDesc"]}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">{dict["marketing.ctaPrimary"]}</Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline">
                  {dict["marketing.ctaSecondary"]}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Wizyta demonstracyjna</DialogTitle>
                  <DialogDescription>
                    Tak może wyglądać podgląd wizyty w kalendarzu stanowisk.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Klient: <span className="font-medium text-foreground">Ana García</span>
                  </p>
                  <p>
                    Usługa: <span className="font-medium text-foreground">Corte + color</span>
                  </p>
                  <p>
                    Czas: <span className="font-medium text-foreground">14:30–16:00</span> •
                    Stanowisko 2
                  </p>
                  <p>Powiadomienie e-mail: wysłane (ES)</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {features.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-lg border border-dashed border-orange-200 bg-white/70 px-4 py-3 text-sm text-foreground shadow-sm"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-base font-semibold text-orange-900">
                  •
                </span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="w-full max-w-md flex-none">
          <Card className="shadow-lg shadow-orange-100/80">
            <CardHeader>
              <CardTitle>Dodaj wizytę w 2 kroki</CardTitle>
              <CardDescription>
                Szybki draft formularza tworzenia wizyty w kalendarzu stanowisk.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Klient</Label>
                <Input id="client" placeholder="Imię i nazwisko" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service">Usługa</Label>
                <Input id="service" placeholder="Strzyżenie / Koloryzacja" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Czas startu</Label>
                <Input id="time" type="time" defaultValue="14:30" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button className="flex-1">Zapisz wizytę</Button>
                <Button variant="ghost" className="flex-1">
                  Podgląd e-mail
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
