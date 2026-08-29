"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Check if device is mobile/tablet
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (!isMobileDevice) {
      setIsInstalled(true); // Hide on desktop
      return;
    }

    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone || localStorage.getItem("pwa-installed") === "true") {
      setIsInstalled(true);
      return;
    }

    setIsInstalled(false);

    // Check if user previously dismissed via X button this session
    if (sessionStorage.getItem("pwa-banner-dismissed") === "true") {
      setDismissed(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
      document.documentElement.style.setProperty("--pwa-banner-h", "40px");
    };

    window.addEventListener("beforeinstallprompt", handler);

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      hideBanner();
      localStorage.setItem("pwa-installed", "true");
    };

    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  function hideBanner() {
    setShowBanner(false);
    document.documentElement.style.setProperty("--pwa-banner-h", "0px");
  }

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      hideBanner();
      localStorage.setItem("pwa-installed", "true");
    } else {
      hideBanner();
      sessionStorage.setItem("pwa-prompt-declined", "true");
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    hideBanner();
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  }, []);

  if (isInstalled || !showBanner || dismissed) return null;

  return (
    <div
      id="pwa-install-banner"
      className="fixed top-0 left-0 right-0 z-[60] bg-[var(--color-lp-brand,#0059bb)] text-white"
    >
      <div className="flex w-full items-center justify-between px-5 py-2 sm:px-8 lg:px-16">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Download className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">
            Install Protealth for a faster, app-like experience
          </span>
          <span className="sm:hidden">Get the Protealth app</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-[var(--color-lp-brand,#0059bb)] transition-colors hover:bg-blue-50 sm:text-sm"
          >
            Download Now
          </button>
        </div>
      </div>
    </div>
  );
}