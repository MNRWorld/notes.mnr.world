"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useSettingsStore } from "@/stores/use-settings";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const font = useSettingsStore((state) => state.font);

  React.useEffect(() => {
    document.documentElement.classList.remove(
      "font-tiro-bangla",
      "font-hind-siliguri",
      "font-baloo-da-2",
    );
    if (font) {
      document.documentElement.classList.add(font);
    }
  }, [font]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
