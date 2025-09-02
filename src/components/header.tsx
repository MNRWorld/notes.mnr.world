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
        "fixed top-0 z-20 flex h-16 w-full items-center justify-center border-b border-border/50 px-4 sm:px-6 lg:hidden",
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
              className="h-12 w-auto rounded-xl transition-all duration-300 group-hover:scale-105"
              width="48"
              height="48"
            >
              <source src="/logo.webm" type="video/webm" />
            </video>
          </div>
        </Link>
      </div>
    </header>
  );
}
