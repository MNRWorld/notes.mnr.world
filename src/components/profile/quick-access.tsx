"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { StaggerContainer, StaggerItem } from "@/components/page-transition";

export default function QuickAccess({
  stats,
}: {
  stats: { archivedNotes: number; trashedNotes: number };
}) {
  return (
    <StaggerContainer>
      <StaggerItem>
        <div className="mb-4 flex items-center gap-2 sm:mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
            <Icons.Bolt className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            দ্রুত অ্যাক্সেস
          </h2>
        </div>
      </StaggerItem>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StaggerItem>
          <Link href="/archive" passHref>
            <motion.div
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="group relative flex cursor-pointer items-center justify-between rounded-xl bg-card/80 backdrop-blur-xl border-border hover:border-primary/40 p-4 transition-all hover:shadow-md hover:-translate-y-px overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center relative z-10">
                <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/20">
                  <Icons.Archive className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/70 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                    আর্কাইভ
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                    {stats.archivedNotes} নোট
                  </p>
                </div>
              </div>
              <Icons.ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
          </Link>
        </StaggerItem>

        <StaggerItem>
          <Link href="/trash" passHref>
            <motion.div
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="group relative flex cursor-pointer items-center justify-between rounded-xl bg-card/80 backdrop-blur-xl border-border hover:border-destructive/40 p-4 transition-all hover:shadow-md hover:-translate-y-px overflow-hidden"
            >
              <div className="absolute inset-0 bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center relative z-10">
                <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/20">
                  <Icons.Trash className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-destructive transition-colors">
                    ট্র্যাশ
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive/60" />
                    {stats.trashedNotes} নোট
                  </p>
                </div>
              </div>
              <Icons.ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
            </motion.div>
          </Link>
        </StaggerItem>
      </div>
    </StaggerContainer>
  );
}
