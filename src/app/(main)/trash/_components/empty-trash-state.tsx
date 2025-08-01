"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

function EmptyTrashState() {
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const iconVariants = {
    hidden: { scale: 0.5, rotate: -15, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center"
    >
      <motion.div
        variants={iconVariants}
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
      >
        <Trash2 className="h-8 w-8 text-primary" />
      </motion.div>
      <motion.h2
        variants={itemVariants}
        className="text-2xl font-semibold tracking-tight text-foreground"
      >
        ট্র্যাশ খালি
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="mt-2 max-w-sm text-muted-foreground"
      >
        আপনি যখন কোনো নোট ডিলিট করবেন, তখন সেটি এখানে এসে জমা হবে।
      </motion.p>
    </motion.div>
  );
}
export default EmptyTrashState;
