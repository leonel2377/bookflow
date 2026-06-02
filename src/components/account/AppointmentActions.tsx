"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";

export function AppointmentActions({ appointmentId }: { appointmentId: string }) {
  const t = useTranslations("account");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function patch(action: "cancel" | "reschedule", payload?: { date: string; time: string }) {
    setLoading(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Error");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function onReschedule() {
    const date = prompt(t("movePromptDate"));
    const time = prompt(t("movePromptTime"), "14:00");
    if (date && time) void patch("reschedule", { date, time });
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={onReschedule}
        className="rounded-full border border-foreground/12 px-3 py-1.5 text-xs font-medium hover:bg-foreground/5"
      >
        {t("move")}
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => {
          if (confirm(t("cancelConfirm"))) void patch("cancel");
        }}
        className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
      >
        {t("cancel")}
      </button>
    </div>
  );
}
