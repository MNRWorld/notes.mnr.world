"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar } from "@capacitor/status-bar";

export default function StatusBarHeightSetter(): null {
  useEffect(() => {
    const setVars = (h: number) => {
      const px = `${Math.round(h)}px`;
      document.documentElement.style.setProperty("--sat", px);
  document.body.style.paddingTop = px;
    };

    const measureSafeArea = () => {
      // create an offscreen element that uses the safe-area env to read computed pixels
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
      el.style.paddingTop = "env(safe-area-inset-top)";
      document.body.appendChild(el);
      const value = parseFloat(getComputedStyle(el).paddingTop) || 0;
      document.body.removeChild(el);
      return value;
    };

    const measureSafeAreaBottom = () => {
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
      el.style.paddingBottom = "env(safe-area-inset-bottom)";
      document.body.appendChild(el);
      const value = parseFloat(getComputedStyle(el).paddingBottom) || 0;
      document.body.removeChild(el);
      return value;
    };

    const setBottom = (b: number) => {
      const px = `${Math.round(b)}px`;
      document.documentElement.style.setProperty("--sab", px);
      document.body.style.paddingBottom = px;
    };

    const apply = async () => {
      if (Capacitor.isNativePlatform() && (StatusBar as any).getInfo) {
        try {
          const info: any = await (StatusBar as any).getInfo();
          const h = info?.statusBarHeight ?? measureSafeArea();
      setVars(h);
      // Measure bottom safe-area / gesture nav. There is no direct Capacitor API
      // for nav bar height, so prefer CSS env and a viewport heuristic.
      const bottomEnv = measureSafeAreaBottom();
      const viewportInset = Math.max(0, window.innerHeight - (window.visualViewport?.height ?? document.documentElement.clientHeight));
      setBottom(Math.max(bottomEnv, viewportInset));
          try { await StatusBar.setOverlaysWebView({ overlay: false }); } catch {}
          return;
        } catch {
          // fall through to web fallback
        }
      }

      // web fallback
    setVars(measureSafeArea());
    const bottomEnv = measureSafeAreaBottom();
    const viewportInset = Math.max(0, window.innerHeight - (window.visualViewport?.height ?? document.documentElement.clientHeight));
    setBottom(Math.max(bottomEnv, viewportInset));
    };

    // run initially and on resize/orientation changes
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, []);

  return null;
}
