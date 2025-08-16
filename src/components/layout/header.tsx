
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isNotesPage = pathname === "/notes";

  if (!isNotesPage) {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed top-0 z-40 flex h-16 w-full items-center justify-center border-b bg-card/80 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-sm sm:gap-x-6 sm:px-6 lg:hidden",
      )}
    >
      <div className="text-lg font-semibold leading-6">
        <Image
          src="/logo.gif"
          alt="আমার নোট"
          width={115}
          height={60}
          unoptimized
        />
      </div>
    </header>
  );
}
