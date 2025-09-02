"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "@/components/ui/icons";
import { motion } from "framer-motion";
import { cn, hapticFeedback } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "নোট", icon: Icons.Book },
  { href: "/templates", label: "টেমপ্লেট", icon: Icons.Files },
  { href: "/profile", label: "প্রোফাইল", icon: Icons.User },
  { href: "/mnrAI", label: "AI", icon: Icons.Sparkles },
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
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href={href}
        onClick={() => {
          hapticFeedback("light");
          onClick?.();
        }}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
        )}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active-indicator"
            className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="truncate relative z-10">{label}</span>
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
    <motion.div
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="flex-1"
    >
      <Link
        href={href}
        onClick={handleClick}
        className={cn(
          "group relative flex flex-col items-center justify-center gap-y-1 rounded-md p-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring h-full",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        aria-label={label}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
        {isActive && (
          <motion.div
            layoutId="mobile-nav-active-indicator"
            className="absolute bottom-0 h-0.5 w-6 rounded-full bg-primary"
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        )}
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
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 200, damping: 25 },
    },
  };

  return (
    <div className="flex h-full flex-col bg-card/50 backdrop-blur-xl border-r border-border">
      <div className="relative overflow-hidden border-b border-border p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10" />
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/" aria-label="Go to homepage">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-12 w-auto rounded-lg shadow-lg"
              width="48"
              height="48"
            >
              <source src="/logo.webm" type="video/webm" />
            </video>
          </Link>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              আমার নোট
            </h1>
            <p className="text-sm text-muted-foreground">
              আপনার ব্যক্তিগত নোটবুক
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <Button
          size="lg"
          onClick={handleNewNoteClick}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-xl h-12 transition-all duration-300 hover:-translate-y-px"
          aria-label="Create a new note"
        >
          <Icons.Plus className="mr-2 h-5 w-5" />
          নতুন নোট
        </Button>
      </div>

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

      <motion.div
        className="border-t border-border/50 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-3 backdrop-blur-sm border border-border/50">
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
  const pathname = usePathname();
  const isEditorPage = pathname.startsWith("/editor");

  const navLinksForMobile = [
    navItems[0], // নোট
    navItems[1], // টেমপ্লেট
    navItems[2], // প্রোফাইল
    navItems[3], // AI
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent onNewNote={onNewNote} />
      </aside>

      {/* Mobile Bottom Navigation */}
      {!isEditorPage && (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t bg-card/80 backdrop-blur-sm lg:hidden pb-4">
          <div className="grid h-16 grid-cols-5 items-stretch px-2">
            <MobileNavLink {...navLinksForMobile[0]} />
            <MobileNavLink {...navLinksForMobile[1]} />

            <div className="flex justify-center items-center">
              <motion.div
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -6, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="relative -top-6"
              >
                <Button
                  className="h-16 w-16 rounded-full bg-primary shadow-lg hover:bg-primary/90 transition-all duration-300"
                  size="icon"
                  onClick={onNewNote}
                  aria-label="Create new note"
                >
                  <Icons.Plus className="h-6 w-6" />
                </Button>
              </motion.div>
            </div>

            <MobileNavLink {...navLinksForMobile[2]} />
            <MobileNavLink {...navLinksForMobile[3]} />
          </div>
        </div>
      )}
    </>
  );
}
Sidebar.displayName = "Sidebar";
