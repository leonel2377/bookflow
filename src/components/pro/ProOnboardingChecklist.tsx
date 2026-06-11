"use client";

import { Check, Circle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProOnboardingStep } from "@/lib/pro-onboarding";
import { cn } from "@/lib/utils";

export function ProOnboardingChecklist({ steps }: { steps: ProOnboardingStep[] }) {
  const t = useTranslations("pro.onboarding");
  const doneCount = steps.filter((s) => s.done).length;
  const progress = Math.round((doneCount / steps.length) * 100);
  const complete = doneCount === steps.length;

  if (complete) {
    return (
      <div className="rounded-2xl border border-pro/20 bg-pro-soft/50 p-5 md:p-6">
        <p className="font-medium text-pro">{t("completeTitle")}</p>
        <p className="mt-1 text-sm text-foreground/65">{t("completeDesc")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-pro/20 bg-white p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold text-pro">{t("title")}</h2>
          <p className="mt-1 text-sm text-foreground/65">{t("subtitle")}</p>
        </div>
        <span className="text-sm font-medium text-pro">
          {t("progress", { done: doneCount, total: steps.length })}
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-foreground/8">
        <div
          className="h-full rounded-full bg-pro transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2">
        {steps.map((step) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                step.done
                  ? "bg-pro-soft/40 text-foreground/70"
                  : "bg-foreground/[0.03] hover:bg-pro-soft/30",
              )}
            >
              {step.done ? (
                <Check className="h-5 w-5 shrink-0 text-pro" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-foreground/30" />
              )}
              <span className={step.done ? "line-through opacity-70" : "font-medium"}>
                {t(`steps.${step.id}`)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
