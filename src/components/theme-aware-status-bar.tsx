"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export const ThemeAwareStatusBar: React.FC = () => {
  const { theme, systemTheme } = useTheme();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const currentTheme = theme === "system" ? systemTheme : theme;

    if (currentTheme === "dark") {
      // Dark theme: light status bar content (for dark app background)
      StatusBar.setStyle({ style: Style.Light });
    } else {
      // Light theme: dark status bar content (for light app background)
      StatusBar.setStyle({ style: Style.Dark });
    }
  }, [theme, systemTheme]);

  return null; // This is a utility component
};

export default ThemeAwareStatusBar;
