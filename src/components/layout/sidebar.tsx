
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Notebook, LayoutDashboard, User, Plus, Archive } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/use-settings";
import { Button } from "../ui/button";

const navItems = [
  { href: "/notes", label: "নোট", icon: Notebook },
  { href: "/dashboard", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/archive", label: "আর্কাইভ", icon: Archive },
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
          "group flex flex-col items-center gap-1 rounded-md p-2 text-xs font-medium leading-6 transition-colors lg:w-full lg:flex-row lg:gap-x-3 lg:p-2 lg:text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "text-primary lg:bg-accent lg:text-accent-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
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
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background px-6 pb-4">
          <div className="flex h-16 w-full shrink-0 items-center justify-center">
            <Link
              href="/notes"
              className="flex items-center gap-2"
              aria-label="Homepage"
            >
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
                  <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
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
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden">
          <div className="grid h-16 grid-cols-5 items-center pb-[env(safe-area-inset-bottom)]">
            {navItems.slice(0, 2).map((item) => (
              <div key={item.label} className="text-center">
                <NavLink {...item} />
              </div>
            ))}
            <div className="relative flex justify-center">
              <motion.div 
                className="absolute -top-7"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1, y: -2, rotate: 15 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Button
                  className="h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90"
                  size="icon"
                  onClick={onNewNote}
                  aria-label="Create new note"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </motion.div>
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
