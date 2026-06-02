"use client";

import { Calendar, CreditCard, Smartphone, Store, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/home/RevealOnScroll";
import { cn } from "@/lib/utils";

const proFeatures = [
  { icon: Calendar, key: "booking" as const },
  { icon: CreditCard, key: "pos" as const },
  { icon: Users, key: "team" as const },
  { icon: Store, key: "addons" as const },
];

const clientFeatures = [
  { icon: Store, key: "profile" as const },
  { icon: Smartphone, key: "sms" as const },
  { icon: Calendar, key: "account" as const },
];

function FeatureItem({
  icon: Icon,
  title,
  text,
  variant,
  index,
}: {
  icon: typeof Calendar;
  title: string;
  text: string;
  variant: "pro" | "client";
  index: number;
}) {
  const isPro = variant === "pro";

  return (
    <RevealOnScroll delay={index * 80}>
      <li className="group flex gap-4">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none",
            isPro ? "bg-pro-soft text-pro" : "bg-accent-soft text-accent",
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="mt-1 text-sm text-foreground/65">{text}</p>
        </div>
      </li>
    </RevealOnScroll>
  );
}

export function HomePageClient() {
  const t = useTranslations("home");

  return (
    <main className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl animate-float-slow"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-32 h-64 w-64 rounded-full bg-pro/15 blur-3xl animate-float-slower"
        />

        <p
          className="animate-fade-up relative text-sm font-medium uppercase tracking-widest text-accent"
          style={{ animationDelay: "0ms" }}
        >
          {t("tagline")}
        </p>
        <h1
          className="animate-fade-up relative mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl"
          style={{ animationDelay: "80ms" }}
        >
          {t("title")}{" "}
          <span className="bg-gradient-to-r from-accent to-pro bg-clip-text text-transparent">
            {t("titleHighlight")}
          </span>
        </h1>
        <p
          className="animate-fade-up relative mt-6 max-w-2xl text-lg text-foreground/70"
          style={{ animationDelay: "160ms" }}
        >
          {t("subtitle")}
        </p>
        <div
          className="animate-fade-up relative mt-10 flex flex-wrap gap-3"
          style={{ animationDelay: "240ms" }}
        >
          <Button href="/pro" className="transition-transform hover:scale-[1.03] active:scale-[0.98]">
            {t("proCta")}
          </Button>
          <Button
            href="/salons"
            variant="secondary"
            className="transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            {t("bookCta")}
          </Button>
        </div>
      </section>

      {/* B2B / B2C */}
      <section className="border-y border-foreground/5 bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2">
          <RevealOnScroll>
            <div className="transition-transform duration-500 hover:-translate-y-1 motion-reduce:transition-none">
              <span className="inline-block animate-badge rounded-full bg-pro-soft px-3 py-1 text-xs font-medium text-pro">
                {t("b2b")}
              </span>
              <h2 className="mt-4 text-2xl font-semibold">{t("b2bTitle")}</h2>
              <p className="mt-2 text-foreground/70">{t("b2bDesc")}</p>
              <ul className="mt-8 space-y-6">
                {proFeatures.map(({ icon, key }, i) => (
                  <FeatureItem
                    key={key}
                    icon={icon}
                    title={t(`proFeatures.${key}.title`)}
                    text={t(`proFeatures.${key}.text`)}
                    variant="pro"
                    index={i}
                  />
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/pro/tarifs" variant="pro" className="transition-transform hover:scale-[1.03]">
                  {t("seeProOffers")}
                </Button>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={120}>
            <div className="transition-transform duration-500 hover:-translate-y-1 motion-reduce:transition-none">
              <span className="inline-block animate-badge rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
                {t("b2c")}
              </span>
              <h2 className="mt-4 text-2xl font-semibold">{t("b2cTitle")}</h2>
              <p className="mt-2 text-foreground/70">{t("b2cDesc")}</p>
              <ul className="mt-8 space-y-6">
                {clientFeatures.map(({ icon, key }, i) => (
                  <FeatureItem
                    key={key}
                    icon={icon}
                    title={t(`clientFeatures.${key}.title`)}
                    text={t(`clientFeatures.${key}.text`)}
                    variant="client"
                    index={i}
                  />
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/salons" className="transition-transform hover:scale-[1.03]">
                  {t("exploreSalons")}
                </Button>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </main>
  );
}
