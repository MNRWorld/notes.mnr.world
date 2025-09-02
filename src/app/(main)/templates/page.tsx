"use client";

import { useEffect } from "react";
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
import { Icons } from "@/components/ui/icons";
import { useTemplatesStore } from "@/stores/use-templates";
import type { CustomTemplate } from "@/lib/types";
import PageTransition, {
  StaggerContainer,
  StaggerItem,
} from "@/components/page-transition";

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
  const Icon = (Icons as any)[template.icon || "FileText"] || Icons.FileText;

  return (
    <StaggerItem>
      <Card
        className="flex h-full flex-col bg-card/80 backdrop-blur-xl border-border transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1"
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
            className="w-full transition-all duration-300 hover:-translate-y-px hover:shadow-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => {
              hapticFeedback("light");
              onUse(template);
            }}
          >
            <Icons.Copy className="mr-2 h-4 w-4" />
            ব্যবহার করুন
          </Button>
          {isCustom && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Icons.Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>আপনি কি নিশ্চিত?</AlertDialogTitle>
                  <AlertDialogDescription>
                    এই টেমপ্লেটটি স্থায়ীভাবে মুছে যাবে।
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>বাতিল</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(template.id)}>
                    মুছে ফেলুন
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>
    </StaggerItem>
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

  const emptyStateIconVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delay: 0.1,
      },
    },
  };

  return (
    <PageTransition
      className={cn(
        "min-h-screen bg-gradient-to-br from-background via-background to-muted/30",
        font,
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8 relative z-10">
        <motion.div
          className="space-y-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <section>
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent mb-3">
                  ডিফল্ট টেমপ্লেট
                </h2>
                <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-xl opacity-60" />
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                দ্রুত কাজ শুরু করতে এই পেশাদার টেমপ্লেটগুলো ব্যবহার করুন।
              </p>
            </motion.div>
            <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {defaultTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isCustom={false}
                  onUse={handleUseTemplate}
                />
              ))}
            </StaggerContainer>
          </section>

          <section>
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight text-foreground mb-3">
                  আপনার টেমপ্লেট
                </h2>
                <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-xl opacity-60" />
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                আপনার তৈরি করা কাস্টম টেমপ্লেট এবং ব্যক্তিগত সংগ্রহ।
              </p>
            </motion.div>
            <AnimatePresence>
              {customTemplates.length > 0 ? (
                <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {customTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isCustom={true}
                      onUse={handleUseTemplate}
                      onDelete={deleteCustomTemplate}
                    />
                  ))}
                </StaggerContainer>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border/50 bg-gradient-to-br from-muted/30 via-muted/20 to-muted/10 backdrop-blur-xl p-16 text-center overflow-hidden"
                >
                  {/* Background decorative elements */}
                  <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-accent/5 rounded-full blur-2xl animate-pulse delay-1000" />

                  <motion.div
                    variants={emptyStateIconVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-accent/15 border border-primary/20 shadow-lg"
                  >
                    <Icons.Files className="h-10 w-10 text-primary drop-shadow-sm" />
                  </motion.div>
                  <h3 className="relative z-10 text-2xl font-bold text-foreground mb-3">
                    কোনো কাস্টম টেমপ্লেট নেই
                  </h3>
                  <p className="relative z-10 max-w-lg text-muted-foreground leading-relaxed">
                    নোট এডিটর থেকে 'টেমপ্লেট হিসেবে সেভ' ব্যবহার করে আপনার নিজের
                    টেমপ্লেট তৈরি করুন এবং পরবর্তীতে দ্রুত ব্যবহার করুন।
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </motion.div>
      </div>
    </PageTransition>
  );
}
