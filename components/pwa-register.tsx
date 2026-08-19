"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "procurex_pwa_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
}

export function PwaRegister() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;
    void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
  }, []);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === "1") return;

    setIos(isIos());

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setOpen(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    if (isIos()) setOpen(true);

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!open) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") dismiss();
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-lg rounded-2xl border border-rule bg-sheet p-4 shadow-[0_16px_48px_-24px_rgba(16,20,16,0.45)] md:inset-x-auto md:right-6 md:bottom-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">Install ProcureX</p>
          <p className="mt-1 text-sm text-ink-soft">
            {ios
              ? "On iPhone, tap Share, then Add to Home Screen."
              : "Add it to your home screen. Same site — no app store."}
          </p>
        </div>
        <button
          type="button"
          className="rounded-full p-1 text-ink-soft hover:bg-paper hover:text-ink"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
        >
          <X className="size-4" />
        </button>
      </div>
      {deferred ? (
        <Button type="button" variant="mark" className="mt-3 w-full" onClick={() => void install()}>
          Install
        </Button>
      ) : null}
    </div>
  );
}
