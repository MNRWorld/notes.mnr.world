
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Notebook,
  LayoutDashboard,
  User,
  Plus,
  Archive,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, hapticFeedback } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href === "/notes" && pathname.startsWith("/editor"));

  const handleClick = () => {
    hapticFeedback("light");
    if (onClick) onClick();
  };

  return (
    <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.15 }}>
      <Link
        href={href}
        onClick={handleClick}
        className={cn(
          "group flex flex-col items-center gap-y-1 rounded-md p-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
      >
        <motion.div
          whileHover={{ scale: 1.15, y: -2, rotate: -5 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        </motion.div>
        <span className="truncate">{label}</span>
      </Link>
    </motion.div>
  );
};
NavLink.displayName = "NavLink";

const SidebarContent = ({
  onNewNote,
  onLinkClick,
}: {
  onNewNote: () => void;
  onLinkClick?: () => void;
}) => {
  const handleNewNoteAndClose = () => {
    onNewNote();
    if (onLinkClick) onLinkClick();
  };

  const navContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  const DesktopNavLink = ({
    href,
    label,
    icon: Icon,
    onClick,
  }: {
    href: string;
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
  }) => {
    const pathname = usePathname();
    const isActive =
      pathname === href ||
      (href === "/notes" && pathname.startsWith("/editor"));

    const handleClick = () => {
      hapticFeedback("light");
      if (onClick) onClick();
    };

    return (
      <motion.div
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
      >
        <Link
          href={href}
          onClick={handleClick}
          className={cn(
            "group flex items-center gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isActive
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          aria-current={isActive ? "page" : undefined}
        >
          <motion.div whileHover={{ scale: 1.1, rotate: -5 }}>
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          </motion.div>
          <span>{label}</span>
        </Link>
      </motion.div>
    );
  };
  DesktopNavLink.displayName = "DesktopNavLink";

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card/50 px-6 pb-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex h-16 shrink-0 items-center justify-center"
      >
        <Link
          href="/notes"
          className="flex items-center gap-2"
          onClick={onLinkClick}
        >
          <Image
            src="/logo.gif"
            alt="আমার নোট"
            width={64}
            height={64}
            className="h-16 w-auto"
            unoptimized
          />
        </Link>
      </motion.div>
      <nav className="flex flex-1 flex-col">
        <ul className="flex flex-1 flex-col gap-y-7">
          <li>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, delay: 0.15 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleNewNoteAndClose}
                size="lg"
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                নতুন নোট
              </Button>
            </motion.div>
          </li>
          <li>
            <motion.ul
              className="-mx-2 space-y-1"
              variants={navContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {navItems.map((item) => (
                <motion.li key={item.label} variants={itemVariants}>
                  <DesktopNavLink {...item} onClick={onLinkClick} />
                </motion.li>
              ))}
            </motion.ul>
          </li>
        </ul>
      </nav>
    </div>
  );
};
SidebarContent.displayName = "SidebarContent";

const MobileSidebar = ({
  isOpen,
  setOpen,
  onNewNote,
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  onNewNote: () => void;
}) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black/80 lg:hidden"
          onClick={() => setOpen(false)}
        />
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-y-0 left-0 z-50 flex w-full max-w-xs lg:hidden"
        >
          <div className="relative flex-1">
            <SidebarContent
              onNewNote={onNewNote}
              onLinkClick={() => setOpen(false)}
            />
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              type="button"
              className="absolute left-full top-4 -m-2.5 p-2.5"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6 text-white" />
            </motion.button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);
MobileSidebar.displayName = "MobileSidebar";

export default function Sidebar({
  onNewNote,
  isOpen,
  setOpen,
  isEditorPage,
}: {
  onNewNote: () => void;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isEditorPage: boolean;
}) {
  return (
    <>
      <MobileSidebar isOpen={isOpen} setOpen={setOpen} onNewNote={onNewNote} />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent onNewNote={onNewNote} />
      </aside>

      {/* Mobile Bottom Bar */}
      {!isEditorPage && (
        <div className="fixed bottom-0 left-0 right-0 z-40 mb-0 border-t bg-card lg:hidden">
          <div className="grid h-16 grid-cols-5 items-center pb-[env(safe-area-inset-bottom)]">
            {navItems.slice(0, 2).map((item) => (
              <div key={item.label} className="text-center">
                <NavLink {...item} />
              </div>
            ))}

            <div className="relative flex justify-center">
              <motion.div
                className="absolute -top-8"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1, y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Button
                  className="h-16 w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90"
                  size="icon"
                  onClick={onNewNote}
                  aria-label="Create new note"
                >
                  <Plus className="h-6 w-6" />
                </Button>
              </motion.div>
            </div>

            {navItems.slice(2, 4).map((item) => (
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
Sidebar.displayName = "Sidebar";
