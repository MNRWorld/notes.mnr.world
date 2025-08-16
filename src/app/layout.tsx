
import type { Metadata, Viewport } from "next";
import { Inter, Tiro_Bangla, Hind_Siliguri, Baloo_Da_2 } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const tiroBangla = Tiro_Bangla({
  subsets: ["bengali"],
  weight: ["400"],
  variable: "--font-tiro-bangla",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

const balooDa2 = Baloo_Da_2({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-baloo-da-2",
});

export const metadata: Metadata = {
  title: "আমার নোট",
  description: "আপনার চিন্তার জন্য একটি নির্মল জায়গা।",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  initialScale: 1,
  width: "device-width",
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${tiroBangla.variable} ${hindSiliguri.variable} ${balooDa2.variable} font-hind-siliguri`}
      suppressHydrationWarning
    >
      <body>
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
