"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./button";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const isEditorPage = pathname.startsWith("/editor");

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 z-20 flex h-16 w-full items-center justify-center border-b border-border bg-background/80 backdrop-blur-xl px-4 sm:px-6 lg:hidden",
        isEditorPage && "hidden",
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative z-10"
      >
        <Link href="/" className="block">
          <motion.video
            src="/logo.webm"
            width={64}
            height={64}
            className="h-16 w-auto rounded-lg"
            autoPlay
            loop
            muted
            playsInline
            whileHover={{ rotate: 5 }}
            transition={{ duration: 0.2 }}
          />
        </Link>
      </motion.div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [-5, 5, -5],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.header>
  );
}
