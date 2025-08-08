"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Notebook, LayoutDashboard, Trash2, User, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { Button } from "../ui/button";

const navItems = [
  { href: "/notes", label: "নোট সমূহ", icon: Notebook },
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/trash", label: "ট্র্যাশ", icon: Trash2 },
  { href: "/profile", label: "প্রোফাইল", icon: User },
];

const NavLink = ({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) => {
  const pathname = usePathname();
  const isActive =
    (href === "/notes" &&
      (pathname === "/notes" || pathname.startsWith("/editor"))) ||
    (href !== "/notes" && pathname.startsWith(href));

  return (
    <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.2 }}>
      <Link
        href={href}
        className={cn(
          "group flex flex-col items-center gap-1 rounded-md p-2 text-xs font-medium leading-6 transition-colors lg:w-full lg:flex-row lg:gap-x-3 lg:p-2 lg:text-sm",
          isActive
            ? "text-primary lg:bg-accent lg:text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="lg:block">{label}</span>
      </Link>
    </motion.div>
  );
};

export default function Sidebar({ onNewNote }: { onNewNote: () => void }) {
  const font = useSettingsStore((state) => state.font);
  const pathname = usePathname();
  const isEditorPage = pathname.startsWith("/editor");

  return (
    <>
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
          <div className="flex h-16 w-full shrink-0 items-center justify-center">
            <Link href="/notes" className="flex items-center gap-2">
              <Image
                src="/logo.gif"
                alt="আমার নোট"
                width={115}
                height={60}
                unoptimized
              />
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <Button onClick={onNewNote} size="lg" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  নতুন নোট
                </Button>
              </li>
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navItems.map((item) => (
                    <li key={item.label}>
                      <NavLink {...item} />
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {!isEditorPage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/80 backdrop-blur-sm lg:hidden">
          <div className="grid h-16 grid-cols-5 items-center pb-[env(safe-area-inset-bottom)]">
            {navItems.slice(0, 2).map((item) => (
              <div key={item.label} className="text-center">
                <NavLink {...item} />
              </div>
            ))}
            <div className="relative flex justify-center">
              <div className="absolute -top-8">
                <Button
                  className="h-16 w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90"
                  size="icon"
                  onClick={onNewNote}
                  aria-label="Create new note"
                >
                  <Plus className="h-8 w-8" />
                </Button>
              </div>
            </div>
            {navItems.slice(2).map((item) => (
              <div key={item.label} className="text-center">
                <NavLink {...item} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
