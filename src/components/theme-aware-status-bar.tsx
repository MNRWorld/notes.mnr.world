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

    const configureStatusBar = async () => {
      // Ensure the status bar is visible and does not overlay the web view
      await StatusBar.setOverlaysWebView({ overlay: false });
      
      // Set the style based on the app theme
      if (currentTheme === "dark") {
        await StatusBar.setStyle({ style: Style.Dark });
      } else {
        await StatusBar.setStyle({ style: Style.Light });
      }
    };

    configureStatusBar();
  }, [theme, systemTheme]);

  return null; // This is a utility component
};

export default ThemeAwareStatusBar;
