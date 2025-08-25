import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

export const metadata: Metadata = {
  title: "আমার নোট",
  description: "আপনার চিন্তার জন্য একটি নির্মল জায়গা।",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c111d" },
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
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link
          href="https://banglawebfonts.pages.dev/css/tiro-bangla.min.css"
          rel="stylesheet"
        />
        <link
          href="https://banglawebfonts.pages.dev/css/hind-siliguri.min.css"
          rel="stylesheet"
        />
        <link
          href="https://banglawebfonts.pages.dev/css/baloo-da-2.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
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
