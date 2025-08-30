"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, User, Plus, Sparkles, FileText, X, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, hapticFeedback } from "@/lib/utils";
import { Button } from "@/components/button";

const navItems = [
  { href: "/", label: "নোটসমূহ", icon: Book },
  { href: "/templates", label: "টেমপ্লেট", icon: FileText },
  { href: "/profile", label: "প্রোফাইল", icon: User },
  { href: "/mnrAI", label: "এআই", icon: Sparkles },
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
  const isActive = pathname === href;

  return (
    <motion.div
      whileHover={{ x: 5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href={href}
        onClick={() => {
          hapticFeedback("light");
          onClick?.();
        }}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden",
          isActive
            ? "bg-primary/20 text-primary shadow-lg border border-primary/20"
            : "text-muted-foreground hover:glass-muted hover:text-foreground border border-transparent hover:border-border",
        )}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
      >
        {/* Background decoration for active state - theme aware */}
        {isActive && (
          <>
            <div className="absolute inset-0 bg-primary/10" />
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
          </>
        )}

        <motion.div
          className="relative z-10"
          whileHover={{ scale: 1.15, y: -2, rotate: isActive ? 0 : -5 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        </motion.div>
        <span className="truncate relative z-10">{label}</span>

        {/* Hover glow effect - theme aware */}
        <motion.div
          className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100"
          initial={false}
          transition={{ duration: 0.2 }}
        />
      </Link>
    </motion.div>
  );
};
NavLink.displayName = "NavLink";

const MobileNavLink = ({
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
    pathname === href || (href === "/" && pathname.startsWith("/editor"));

  const handleClick = () => {
    hapticFeedback("light");
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
        <motion.div whileHover={{ scale: 1.15, y: -2, rotate: -5 }}>
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        </motion.div>
        <span className="truncate">{label}</span>
      </Link>
    </motion.div>
  );
};

const SidebarContent = ({
  onNewNote,
  onLinkClick,
}: {
  onNewNote: () => void;
  onLinkClick?: () => void;
}) => {
  const handleNewNoteClick = () => {
    onNewNote();
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div className="flex h-full flex-col bg-background backdrop-blur-xl border-r border-border">
      {/* Enhanced Header */}
      <motion.div
        className="relative overflow-hidden border-b border-border p-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background decoration - theme aware */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10" />
        <div className="absolute inset-0 opacity-20 dot-pattern-primary" />

        <motion.div
          className="relative z-10 flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <motion.video
            src="/logo.webm"
            width={48}
            height={48}
            className="h-12 w-auto rounded-lg shadow-lg"
            autoPlay
            loop
            muted
            playsInline
            whileHover={{ rotate: 5 }}
          />
          <div>
            <motion.h1
              className="text-xl font-bold gradient-text-primary"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              আমার নোট
            </motion.h1>
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              চিন্তার নির্মল জায়গা
            </motion.p>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced New Note Button */}
      <motion.div
        className="p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            onClick={handleNewNoteClick}
            className="w-full bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg border-0 rounded-xl h-12 hover-lift"
            aria-label="নতুন নোট তৈরি করুন"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="mr-2 h-5 w-5" />
            </motion.div>
            নতুন নোট
          </Button>
        </motion.div>
      </motion.div>

      {/* Enhanced Navigation */}
      <motion.nav
        className="flex-1 px-4 pb-4"
        variants={navContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="space-y-2">
          {navItems.map((item) => (
            <motion.div key={item.href} variants={itemVariants}>
              <NavLink {...item} onClick={onLinkClick} />
            </motion.div>
          ))}
        </div>
      </motion.nav>

      {/* Enhanced Footer */}
      <motion.div
        className="border-t border-white/10 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-3 backdrop-blur-sm border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5" />
          <p className="relative z-10 text-center text-xs text-muted-foreground">
            তৈরি করেছেন{" "}
            <span className="font-medium text-primary">FrostFoe</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
SidebarContent.displayName = "SidebarContent";

export default function Sidebar({ onNewNote }: { onNewNote: () => void }) {
  const navLinksForMobile = [
    navItems[0],
    navItems[1],
    navItems[2],
    navItems[3],
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent onNewNote={onNewNote} />
      </aside>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-card/80 backdrop-blur-sm lg:hidden">
        <div className="grid h-16 grid-cols-5 items-center px-2">
          <MobileNavLink {...navLinksForMobile[0]} />
          <MobileNavLink {...navLinksForMobile[1]} />
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
                aria-label="নতুন নোট তৈরি করুন"
              >
                <Plus className="h-6 w-6" />
              </Button>
            </motion.div>
          </div>
          <MobileNavLink {...navLinksForMobile[2]} />
          <MobileNavLink {...navLinksForMobile[3]} />
        </div>
      </div>
    </>
  );
}
Sidebar.displayName = "Sidebar";
