import { Calendar, Check, Scissors, Sparkles, Store, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export async function PartnerLanding() {
  const t = await getTranslations("partner");

  const benefits = [
    { icon: Calendar, key: "booking" as const },
    { icon: Users, key: "team" as const },
    { icon: Store, key: "visibility" as const },
  ];

  const steps = ["step1", "step2", "step3"] as const;
  const faq = ["q1", "q2", "q3"] as const;

  return (
    <div className="pb-16">
      <section className="rounded-3xl border border-pro/15 bg-gradient-to-br from-pro-soft via-white to-accent-soft/30 p-8 md:p-12">
        <p className="text-sm font-medium uppercase tracking-widest text-pro">{t("eyebrow")}</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-semibold md:text-4xl">{t("heroTitle")}</h1>
        <p className="mt-4 max-w-xl text-foreground/70">{t("heroSubtitle")}</p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {[t("badgeNoCommitment"), t("badgeNoCommission"), t("badgeFast")].map((badge) => (
            <li
              key={badge}
              className="inline-flex items-center gap-1.5 rounded-full border border-pro/20 bg-white px-3 py-1.5 text-xs font-medium text-pro"
            >
              <Check className="h-3.5 w-3.5" />
              {badge}
            </li>
          ))}
        </ul>

        <p className="mt-6 flex items-center gap-2 text-sm text-foreground/60">
          <Scissors className="h-4 w-4 shrink-0 text-pro" />
          {t("sectors")}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-center text-sm font-medium uppercase tracking-widest text-foreground/50">
          {t("chooseTitle")}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            href="/pro/inscription"
            className="group rounded-2xl border-2 border-pro bg-pro p-6 text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-8 w-8 opacity-90" />
            <h3 className="mt-4 text-xl font-semibold">{t("choicePro")}</h3>
            <p className="mt-2 text-sm text-white/80">{t("choiceProDesc")}</p>
            <span className="mt-4 inline-block text-sm font-medium underline-offset-4 group-hover:underline">
              {t("choiceProCta")} →
            </span>
          </Link>
          <Link
            href="/salons"
            className="group rounded-2xl border-2 border-foreground/10 bg-white p-6 transition-transform hover:border-accent hover:scale-[1.02] active:scale-[0.98]"
          >
            <Calendar className="h-8 w-8 text-accent" />
            <h3 className="mt-4 text-xl font-semibold">{t("choiceClient")}</h3>
            <p className="mt-2 text-sm text-foreground/65">{t("choiceClientDesc")}</p>
            <span className="mt-4 inline-block text-sm font-medium text-accent underline-offset-4 group-hover:underline">
              {t("choiceClientCta")} →
            </span>
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">{t("benefitsTitle")}</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {benefits.map(({ icon: Icon, key }) => (
            <li key={key} className="rounded-2xl border border-foreground/8 bg-white p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pro-soft text-pro">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-medium">{t(`benefits.${key}.title`)}</h3>
              <p className="mt-2 text-sm text-foreground/65">{t(`benefits.${key}.text`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 rounded-2xl bg-white border border-foreground/8 p-8">
        <h2 className="text-2xl font-semibold">{t("stepsTitle")}</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pro text-sm font-semibold text-white">
                {i + 1}
              </span>
              <h3 className="mt-4 font-medium">{t(`${step}.title`)}</h3>
              <p className="mt-1 text-sm text-foreground/65">{t(`${step}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 text-center">
        <h2 className="text-2xl font-semibold">{t("plansTeaser")}</h2>
        <p className="mt-2 text-foreground/70">{t("plansTeaserDesc")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button href="/pro/inscription" variant="pro">
            {t("ctaRegister")}
          </Button>
          <Button href="/pro/tarifs" variant="secondary">
            {t("ctaPlans")}
          </Button>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-xl font-semibold">{t("faqTitle")}</h2>
        <dl className="mt-6 space-y-4">
          {faq.map((key) => (
            <div key={key} className="rounded-xl border border-foreground/8 bg-white px-5 py-4">
              <dt className="font-medium">{t(`faq.${key}.q`)}</dt>
              <dd className="mt-2 text-sm text-foreground/65">{t(`faq.${key}.a`)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16 rounded-2xl bg-pro p-8 text-center text-white md:p-10">
        <h2 className="text-2xl font-semibold">{t("finalTitle")}</h2>
        <p className="mt-2 text-white/80">{t("finalDesc")}</p>
        <Button href="/pro/inscription" variant="secondary" className="mt-6 !bg-white !text-pro hover:!bg-white/90">
          {t("ctaRegister")}
        </Button>
      </section>
    </div>
  );
}
