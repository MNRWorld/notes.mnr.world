"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import { useSettingsStore } from "@/stores/use-settings";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const font = useSettingsStore((state) => state.font);

  React.useEffect(() => {
    const body = document.body;

    // Remove any existing font- class
    body.classList.forEach((className) => {
      if (className.startsWith("font-")) {
        body.classList.remove(className);
      }
    });

    // Add the new font class
    if (font) {
      body.classList.add(font);
    }
  }, [font]);

  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme="dusk"
      enableSystem
      themes={[
        "light",
        "dark",
        "dusk",
        "rose",
        "sakura",
        "mint",
        "sea",
        "lavender",
        "oasis",
        "terra",
        "twilight",
      ]}
    >
      {children}
    </NextThemesProvider>
  );
}
