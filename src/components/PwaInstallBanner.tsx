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
  const [isInstalled, setIsInstalled] = useState(true); // default true to prevent flash
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed via X button this session
    if (sessionStorage.getItem("pwa-banner-dismissed") === "true") {
      setDismissed(true);
    }

    setIsInstalled(false);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowBanner(false);
      // Persist so banner never shows again on this device
      localStorage.setItem("pwa-installed", "true");
    };

    window.addEventListener("appinstalled", installedHandler);

    // If previously installed (in case standalone check misses it)
    if (localStorage.getItem("pwa-installed") === "true") {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      // Installed successfully — hide forever
      setIsInstalled(true);
      setShowBanner(false);
      localStorage.setItem("pwa-installed", "true");
    } else {
      // User dismissed the native prompt — hide banner for this session only
      // Next visit it will appear again
      setShowBanner(false);
      sessionStorage.setItem("pwa-prompt-declined", "true");
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    setShowBanner(false);
    // X button dismiss — hide for this session
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  }, []);

  // Don't render if: already installed, banner not ready, or user dismissed via X
  if (isInstalled || !showBanner || dismissed) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg animate-in slide-in-from-top duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Download className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">
            Install HealthHere for a faster, app-like experience
          </span>
          <span className="sm:hidden">Get the HealthHere app</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="rounded-lg bg-white px-4 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50 sm:text-sm"
          >
            Download Now
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1.5 transition-colors hover:bg-white/20"
            aria-label="Dismiss install banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
