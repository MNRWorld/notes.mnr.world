
"use client";

import { Fragment } from "react";
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
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { cn } from "@/lib/utils";
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

  return (
    <motion.div whileHover={{ y: -2, scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.15 }}>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "group flex flex-col items-center gap-y-1 rounded-md p-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        aria-current={isActive ? "page" : undefined}
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
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
      pathname === href || (href === "/notes" && pathname.startsWith("/editor"));

    return (
      <motion.div whileHover={{ x: 2, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.15 }}>
        <Link
          href={href}
          onClick={onClick}
          className={cn(
            "group flex items-center gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isActive
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          aria-current={isActive ? "page" : undefined}
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
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
            width={115}
            height={60}
            unoptimized
          />
        </Link>
      </motion.div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3, delay: 0.15 }}
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
              role="list"
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
      {/* Mobile Sidebar (slide-in) */}
      <Transition show={isOpen} as={Fragment}>
        <Dialog className="relative z-50 lg:hidden" onClose={setOpen}>
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </TransitionChild>

          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                <TransitionChild
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </TransitionChild>
                <SidebarContent
                  onNewNote={onNewNote}
                  onLinkClick={() => setOpen(false)}
                />
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

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
                className="absolute -top-7"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1, y: -2, rotate: 15 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
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
