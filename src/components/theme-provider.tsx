"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
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
