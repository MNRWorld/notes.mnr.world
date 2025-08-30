"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useNotesStore } from "@/stores/use-notes";
import { useSettingsStore } from "@/stores/use-settings";
import { cn } from "@/lib/utils";
import { templates as defaultTemplates, NoteTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { hapticFeedback } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { FileText, Copy, Trash2 } from "lucide-react";
import { useTemplatesStore } from "@/stores/use-templates";
import type { CustomTemplate } from "@/lib/types";

type Template = NoteTemplate | CustomTemplate;

const isNoteTemplate = (template: Template): template is NoteTemplate => {
  return "description" in template;
};

interface TemplateCardProps {
  template: Template;
  isCustom: boolean;
  onUse: (template: Template) => void;
  onDelete?: (id: string) => void;
}

const TemplateCard = ({
  template,
  isCustom,
  onUse,
  onDelete,
}: TemplateCardProps) => {
  const Icon = (LucideIcons as any)[template.icon || "FileText"] || FileText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
      className="h-full"
    >
      <Card
        className="flex h-full flex-col glass-card hover-lift border-border transition-all duration-300 hover:shadow-xl"
        data-testid={`template-card-${template.id}`}
      >
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>{template.title}</CardTitle>
              {isNoteTemplate(template) && (
                <CardDescription>{template.description}</CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow" />
        <CardFooter className="flex items-center gap-2">
          <Button
            className="w-full hover-lift glow-primary"
            onClick={() => {
              hapticFeedback("light");
              onUse(template);
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            ব্যবহার করুন
          </Button>
          {isCustom && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                  <AlertDialogDescription>
                    টেমপ্লেটটি স্থায়ীভাবে মুছে যাবে, এটি বাতিল করা যাবে না।
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(template.id)}>
                    মুছুন
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default function TemplatesPage() {
  const router = useRouter();
  const createNoteFromTemplate = useNotesStore(
    (state) => state.createNoteFromTemplate,
  );
  const { customTemplates, fetchCustomTemplates, deleteCustomTemplate } =
    useTemplatesStore();
  const font = useSettingsStore((state) => state.font);
  const fontClass = font.split(" ")[0];

  useEffect(() => {
    fetchCustomTemplates();
  }, [fetchCustomTemplates]);

  const handleUseTemplate = async (template: Template) => {
    try {
      const templateToUse: NoteTemplate = isNoteTemplate(template)
        ? template
        : {
            id: template.id,
            title: template.title,
            icon: template.icon || "FileText",
            description: "",
            content: template.content,
          };

      const newNoteId = await createNoteFromTemplate(templateToUse);
      if (newNoteId) {
        router.push(`/editor?noteId=${newNoteId}`);
      }
    } catch (error) {}
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const emptyStateIconVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -15 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2,
      },
    },
  };

  return (
    <div className={cn("min-h-screen bg-background", fontClass)}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight gradient-text-primary mb-2">
                ডিফল্ট টেমপ্লেট
              </h2>
              <p className="text-muted-foreground">
                কাজ দ্রুত শুরু করতে এই টেমপ্লেটগুলো ব্যবহার করুন।
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {defaultTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isCustom={false}
                  onUse={handleUseTemplate}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                আপনার টেমপ্লেট
              </h2>
              <p className="text-muted-foreground">
                আপনার তৈরি করা টেমপ্লেট।
              </p>
            </div>
            <AnimatePresence>
              {customTemplates.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {customTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isCustom={true}
                      onUse={handleUseTemplate}
                      onDelete={deleteCustomTemplate}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border glass-muted p-12 text-center"
                >
                  <motion.div
                    variants={emptyStateIconVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
                  >
                    <FileText className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground">
                    কোনো কাস্টম টেমপ্লেট নেই
                  </h3>
                  <p className="mt-2 max-w-sm text-muted-foreground">
                    'টেমপ্লেট হিসাবে সংরক্ষণ' ব্যবহার করে নতুন টেমপ্লেট তৈরি করুন।
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </motion.div>
      </div>

      <div className="pb-16 lg:pb-8" />
    </div>
  );
}
