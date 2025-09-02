"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export default function Header() {
  const pathname = usePathname();
  const isEditorPage = pathname.startsWith("/editor");

  return (
    <header
      className={cn(
        "fixed top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 px-4 sm:px-6 lg:hidden shadow-sm",
        isEditorPage && "hidden",
      )}
    >
      <div className="relative z-10">
        <Link href="/" className="block group" aria-label="হোম পেজে যান">
          <div className="relative">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-12 w-auto rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105"
              width="48"
              height="48"
            >
              <source src="/logo.webm" type="video/webm" />
            </video>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
      </div>
    </header>
  );
}
