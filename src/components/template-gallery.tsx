"use client";

import { motion } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { templates as defaultTemplates, NoteTemplate } from "@/lib/templates";

interface TemplateGalleryProps {
  onSelectTemplate: (template: NoteTemplate) => void;
}

export default function TemplateGallery({
  onSelectTemplate,
}: TemplateGalleryProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {defaultTemplates.map((template) => {
        const Icon = (Icons as any)[template.icon] || Icons.FileText;
        return (
          <motion.div
            key={template.id}
            variants={itemVariants}
            whileHover={{
              y: -8,
              scale: 1.02,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }}
            whileTap={{ scale: 0.98 }}
            className="flex h-full"
          >
            <div className="group relative flex h-full w-full flex-col rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/60 to-card/40 backdrop-blur-xl p-6 text-left shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Icon container */}
              <motion.div
                className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/15 border border-primary/20 shadow-md group-hover:shadow-lg transition-all duration-300"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Icon className="h-8 w-8 text-primary drop-shadow-sm" />
              </motion.div>

              <div className="relative z-10 flex-grow">
                <h3 className="mb-3 font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                  {template.title}
                </h3>
                <p className="flex-grow text-sm text-muted-foreground leading-relaxed mb-6">
                  {template.description}
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative z-10"
              >
                <Button
                  onClick={() => onSelectTemplate(template)}
                  className="w-full bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl h-12 font-medium"
                  variant="default"
                >
                  <Icons.Plus className="mr-2 h-4 w-4" />
                  ব্যবহার করুন
                </Button>
              </motion.div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 w-4 h-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300" />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
