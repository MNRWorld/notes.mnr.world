import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/error-boundary";
import ThemeAwareStatusBar from "@/components/theme-aware-status-bar";

import "./globals.css";

export const metadata: Metadata = {
  title: "আমার নোট",
  description: "আপনার চিন্তার জন্য একটি নির্মল জায়গা।",
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  initialScale: 1,
  width: "device-width",
  viewportFit: "cover",
  userScalable: false,
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
          rel="preload"
          href="/fonts/tiro-bangla-regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/hind-siliguri-regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/baloo-da-2-regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: "Tiro Bangla";
                src: url("/fonts/tiro-bangla-regular.woff2") format("woff2");
                font-weight: 400;
                font-style: normal;
                font-display: swap;
              }

              @font-face {
                font-family: "Hind Siliguri";
                src: url("/fonts/hind-siliguri-regular.woff2") format("woff2");
                font-weight: 400;
                font-style: normal;
                font-display: swap;
              }

              @font-face {
                font-family: "Baloo Da 2";
                src: url("/fonts/baloo-da-2-regular.woff2") format("woff2");
                font-weight: 400;
                font-style: normal;
                font-display: swap;
              }
            `,
          }}
        />
        <meta name="mobile-web-app-capable" content="no" />
        <meta name="apple-mobile-web-app-capable" content="no" />
      </head>
      <body className="font-sans">
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeAwareStatusBar />
            <main>{children}</main>
            <Toaster richColors duration={1500} />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
