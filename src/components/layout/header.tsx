"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface HeaderProps {
  onSidebarOpen: () => void;
}

export default function Header({ onSidebarOpen }: HeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 z-40 flex h-16 w-full items-center justify-center border-b bg-card/80 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-sm sm:gap-x-6 sm:px-6 lg:hidden",
      )}
    >
      <div className="flex justify-center">
        <Image
          src="/logo.gif"
          alt="আমার নোট"
          width={64}
          height={64}
          className="h-16 w-auto"
          unoptimized
        />
      </div>
    </header>
  );
}
