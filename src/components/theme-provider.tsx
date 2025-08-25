
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useSettingsStore } from "@/stores/use-settings";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const font = useSettingsStore((state) => state.font);

  React.useEffect(() => {
    document.body.classList.forEach(className => {
      if (className.startsWith('font-')) {
        document.body.classList.remove(className);
      }
    });
    if (font) {
      document.body.classList.add(font);
    }
  }, [font]);

  return (
    <NextThemesProvider
      {...props}
      themes={[
        "light",
        "dark",
        "rose",
        "mint",
        "dusk",
        "lavender",
        "terra",
        "sea",
      ]}
    >
      {children}
    </NextThemesProvider>
  );
}
