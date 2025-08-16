
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const isEditorPage = pathname.startsWith('/editor');

  if (isEditorPage) {
    return null;
  }

  return (
    <header className={cn(
      "fixed top-0 z-40 flex h-16 w-full items-center border-b bg-card/80 backdrop-blur-sm px-4 pt-[env(safe-area-inset-top)] sm:gap-x-6 sm:px-6 lg:hidden",
    )}>
       <Button variant="ghost" size="icon" className="-ml-2" onClick={onMenuClick}>
          <Menu className="h-6 w-6" />
        </Button>
      <div className="flex flex-1 justify-center text-lg font-semibold leading-6">
        <Image
          src="/logo.gif"
          alt="আমার নোট"
          width={115}
          height={60}
          unoptimized
        />
      </div>
      <div className="w-8" />
    </header>
  );
}
