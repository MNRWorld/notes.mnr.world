"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export default function StatusBarHeightSetter(): null {
  useEffect(() => {
    const setVars = (h: number) => {
      const px = `${Math.round(h)}px`;
      document.documentElement.style.setProperty("--sat", px);
      document.body.style.paddingTop = px;
    };

    const measureSafeArea = (inset: "top" | "bottom") => {
      // create an offscreen element that uses the safe-area env to read computed pixels
      const el = document.createElement("div");
      el.style.position = "absolute";
      el.style.visibility = "hidden";
      el.style.pointerEvents = "none";
      if (inset === "top") {
        el.style.paddingTop = "env(safe-area-inset-top)";
      } else {
        el.style.paddingBottom = "env(safe-area-inset-bottom)";
      }
      document.body.appendChild(el);
      const value =
        parseFloat(
          getComputedStyle(el)[inset === "top" ? "paddingTop" : "paddingBottom"],
        ) || 0;
      document.body.removeChild(el);
      return value;
    };

    const setBottom = (b: number) => {
      const px = `${Math.round(b)}px`;
      document.documentElement.style.setProperty("--sab", px);
      document.body.style.paddingBottom = px;
    };

    const apply = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.setOverlaysWebView({ overlay: false });
          await StatusBar.setStyle({ style: Style.Light }); // Default to Light
          await StatusBar.show();

          const info: any = await (StatusBar as any).getInfo();
          const h = info?.statusBarHeight ?? measureSafeArea("top");
          setVars(h);

          const bottomEnv = measureSafeArea("bottom");
          const viewportInset = Math.max(
            0,
            window.innerHeight -
              (window.visualViewport?.height ??
                document.documentElement.clientHeight),
          );
          setBottom(Math.max(bottomEnv, viewportInset));

          return;
        } catch (e) {
          console.error("Status bar setup failed", e);
        }
      }

      // web fallback
      setVars(measureSafeArea("top"));
      const bottomEnv = measureSafeArea("bottom");
      const viewportInset = Math.max(
        0,
        window.innerHeight -
          (window.visualViewport?.height ??
            document.documentElement.clientHeight),
      );
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
