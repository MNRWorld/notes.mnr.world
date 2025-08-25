
"use client";

import { useEffect } from "react";
import type { Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { useSettingsStore } from "@/stores/use-settings";

import "./globals.css";

// This can't be in metadata because we need a client component to access zustand
const AppMetadata = () => {
  useEffect(() => {
    document.title = "আমার নোট";
    const setMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute("name", name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };
    setMeta("description", "আপনার চিন্তার জন্য একটি নির্মল জায়গা।");
    
    let manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) {
      manifest = document.createElement('link');
      manifest.setAttribute('rel', 'manifest');
      document.head.appendChild(manifest);
    }
    manifest.setAttribute('href', '/manifest.json');
    
    let icon = document.querySelector('link[rel="icon"]');
    if (!icon) {
      icon = document.createElement('link');
      icon.setAttribute('rel', 'icon');
      document.head.appendChild(icon);
    }
    icon.setAttribute('href', '/favicon.png');

  }, []);

  return null;
};


export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  initialScale: 1,
  width: "device-width",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const font = useSettingsStore((state) => state.font);

  useEffect(() => {
    document.documentElement.classList.forEach((className) => {
      if (className.startsWith("font-")) {
        document.documentElement.classList.remove(className);
      }
    });
    if (font) {
      document.documentElement.classList.add(font);
    }
  }, [font]);
  
  return (
    <html lang="bn" suppressHydrationWarning>
      <head />
      <body>
        <AppMetadata />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors duration={1500} />
        </ThemeProvider>
      </body>
    </html>
  );
}
