"use client";

import React from "react";
import {
  AnimatedContainer,
  AnimatedItem,
  PageTransition,
} from "@/components/ui/animated";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { useMultipleLoadingStates } from "@/hooks/common-hooks";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/types";

// Base page layout with common structure
interface BasePageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  back?: boolean;
  onBack?: () => void;
}

export const BasePageLayout: React.FC<BasePageLayoutProps> = ({
  title,
  description,
  children,
  className,
  actions,
  back = false,
  onBack,
}) => {
  return (
    <PageTransition className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {back && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="rounded-full p-2"
                >
                  <Icons.ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center gap-2">{actions}</div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </PageTransition>
  );
};

// Notes management page layout (for archive, trash, etc.)
interface NotesManagementLayoutProps {
  title: string;
  description: string;
  notes: Note[];
  emptyStateTitle: string;
  emptyStateDescription: string;
  emptyStateIcon: React.ComponentType<{ className?: string }>;
  actions: {
    primary?: {
      label: string;
      onClick: (id: string) => Promise<void>;
      icon: React.ComponentType<{ className?: string }>;
      variant?: "default" | "destructive" | "outline";
    };
    secondary?: {
      label: string;
      onClick: (id: string) => Promise<void>;
      icon: React.ComponentType<{ className?: string }>;
      variant?: "default" | "destructive" | "outline";
    };
  };
  bulkActions?: {
    label: string;
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    variant?: "default" | "destructive" | "outline";
  }[];
  className?: string;
}

export const NotesManagementLayout: React.FC<NotesManagementLayoutProps> = ({
  title,
  description,
  notes,
  emptyStateTitle,
  emptyStateDescription,
  emptyStateIcon: EmptyIcon,
  actions,
  bulkActions = [],
  className,
}) => {
  const { createHandler, isLoading } = useMultipleLoadingStates();

  const handlePrimaryAction = createHandler(
    "primary",
    actions.primary?.onClick || (async () => {}),
    { successMessage: `${actions.primary?.label} সম্পন্ন হয়েছে।` },
  );

  const handleSecondaryAction = createHandler(
    "secondary",
    actions.secondary?.onClick || (async () => {}),
    { successMessage: `${actions.secondary?.label} সম্পন্ন হয়েছে।` },
  );

  return (
    <BasePageLayout
      title={title}
      description={description}
      className={className}
      actions={
        bulkActions.length > 0 && notes.length > 0 ? (
          <div className="flex items-center gap-2">
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={action.onClick}
                disabled={isLoading("bulk")}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </div>
        ) : undefined
      }
    >
      <div className="container mx-auto p-4 h-full">
        {notes.length === 0 ? (
          /* Empty State */
          <AnimatedContainer
            variant="staggerContainer"
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <AnimatedItem variant="fadeInItem">
              <EmptyIcon className="h-16 w-16 text-muted-foreground/50 mb-4" />
            </AnimatedItem>
            <AnimatedItem variant="slideUpItem">
              <h3 className="text-lg font-semibold mb-2">{emptyStateTitle}</h3>
              <p className="text-muted-foreground max-w-md">
                {emptyStateDescription}
              </p>
            </AnimatedItem>
          </AnimatedContainer>
        ) : (
          /* Notes Grid */
          <AnimatedContainer variant="staggerContainer" className="space-y-4">
            <AnimatedItem variant="slideUpItem">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-sm">
                  {notes.length} টি নোট
                </Badge>
              </div>
            </AnimatedItem>

            <AnimatedContainer
              variant="staggerContainer"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {notes.map((note) => (
                <AnimatedItem
                  key={note.id}
                  variant="slideUpItem"
                  className="group relative"
                >
                  <div className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium line-clamp-2 flex-1 pr-2">
                        {note.title || "শিরোনামহীন নোট"}
                      </h3>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {actions.primary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePrimaryAction(note.id)}
                            disabled={isLoading("primary")}
                            className="h-8 w-8 p-0"
                          >
                            <actions.primary.icon className="h-4 w-4" />
                          </Button>
                        )}
                        {actions.secondary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSecondaryAction(note.id)}
                            disabled={isLoading("secondary")}
                            className="h-8 w-8 p-0"
                          >
                            <actions.secondary.icon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Icons.Calendar className="h-3 w-3" />
                          {new Date(note.updatedAt).toLocaleDateString("bn-BD")}
                        </span>
                        {note.tags && note.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Icons.Tag className="h-3 w-3" />
                            {note.tags.length}
                          </span>
                        )}
                      </div>

                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {note.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs px-2 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {note.tags.length > 3 && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-0"
                            >
                              +{note.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </AnimatedContainer>
          </AnimatedContainer>
        )}
      </div>
    </BasePageLayout>
  );
};

// Settings page layout
interface SettingsLayoutProps {
  title: string;
  description?: string;
  categories: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    component: React.ComponentType;
  }>;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  title,
  description,
  categories,
  activeCategory,
  onCategoryChange,
  className,
}) => {
  const ActiveComponent = categories.find(
    (cat) => cat.id === activeCategory,
  )?.component;

  return (
    <BasePageLayout
      title={title}
      description={description}
      className={className}
    >
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-muted/20 p-4">
          <AnimatedContainer variant="staggerContainer" className="space-y-2">
            {categories.map((category) => (
              <AnimatedItem key={category.id} variant="slideInItem">
                <Button
                  variant={activeCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => onCategoryChange(category.id)}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              </AnimatedItem>
            ))}
          </AnimatedContainer>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">{ActiveComponent && <ActiveComponent />}</div>
        </div>
      </div>
    </BasePageLayout>
  );
};

// Template gallery layout
interface TemplateGalleryLayoutProps {
  title: string;
  description?: string;
  sections: Array<{
    id: string;
    title: string;
    description: string;
    items: any[];
    renderItem: (item: any) => React.ReactNode;
    emptyState?: {
      title: string;
      description: string;
      icon: React.ComponentType<{ className?: string }>;
    };
  }>;
  className?: string;
}

export const TemplateGalleryLayout: React.FC<TemplateGalleryLayoutProps> = ({
  title,
  description,
  sections,
  className,
}) => {
  return (
    <BasePageLayout
      title={title}
      description={description}
      className={className}
    >
      <div className="container mx-auto p-6 space-y-12">
        {sections.map((section) => (
          <AnimatedContainer key={section.id} variant="staggerContainer">
            <AnimatedItem variant="slideUpItem">
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  {section.title}
                </h2>
                <p className="text-muted-foreground">{section.description}</p>
              </div>
            </AnimatedItem>

            {section.items.length === 0 && section.emptyState ? (
              <AnimatedItem variant="fadeInItem">
                <div className="text-center py-12">
                  <section.emptyState.icon className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {section.emptyState.title}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {section.emptyState.description}
                  </p>
                </div>
              </AnimatedItem>
            ) : (
              <AnimatedContainer
                variant="staggerContainer"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {section.items.map((item, index) => (
                  <AnimatedItem key={index} variant="slideUpItem">
                    {section.renderItem(item)}
                  </AnimatedItem>
                ))}
              </AnimatedContainer>
            )}
          </AnimatedContainer>
        ))}
      </div>
    </BasePageLayout>
  );
};
