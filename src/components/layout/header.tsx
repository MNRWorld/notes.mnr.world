
"use client";

import Image from "next/image";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="fixed top-0 z-40 mt-0 flex h-16 w-full shrink-0 items-center justify-center border-b bg-card px-4 pt-[env(safe-area-inset-top)] shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
      <div className="flex justify-center text-lg font-semibold leading-6">
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
