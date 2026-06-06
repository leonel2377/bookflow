"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "bookflow-pwa-dismiss";

export function PwaInstallBanner() {
  const t = useTranslations("pwa");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    if (standalone || sessionStorage.getItem(DISMISS_KEY)) return;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferred(null);
  }

  function dismiss() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (isStandalone || !visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-20 z-[60] p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:bottom-4 md:left-auto md:right-4 md:max-w-sm md:p-0"
      role="region"
      aria-label={t("installTitle")}
    >
      <div className="rounded-2xl border border-foreground/10 bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t("installTitle")}</p>
            <p className="mt-1 text-sm text-foreground/65">{t("installDesc")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void install()}
                className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                {t("installCta")}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="rounded-full px-4 py-2 text-sm text-foreground/60 hover:text-foreground"
              >
                {t("installLater")}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="shrink-0 rounded-lg p-1 text-foreground/45 hover:bg-foreground/5 hover:text-foreground"
            aria-label={t("installClose")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-xs text-foreground/45">{t("installIosHint")}</p>
      </div>
    </div>
  );
}
