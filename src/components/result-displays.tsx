"use client";

import { motion } from "framer-motion";
import { BookOpen, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { WikiPage, ArticleItem } from "@/components/types";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";

export const WikiResultDisplay = ({ result }: { result: WikiPage | null }) => {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 500 }}
      className="space-y-4"
    >
      <Card className="border border-border bg-card shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <BookOpen className="h-5 w-5" />
              </motion.div>
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent font-bold">
                {result.title}
              </span>
            </div>
            {result.pageid !== 0 && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-primary/10 rounded-xl"
                >
                  <a
                    href={`https://bn.wikipedia.org/?curid=${result.pageid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Read on Wikipedia"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </motion.div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.p
            className="whitespace-pre-wrap text-muted-foreground leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {result.extract}
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
WikiResultDisplay.displayName = "WikiResultDisplay";

export const ArticleResultDisplay = ({
  results,
}: {
  results: ArticleItem[] | null;
}) => {
  if (!results || results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 500 }}
      className="space-y-4"
    >
      <motion.h2
        className="px-2 text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        আর্টিকেল ফলাফল
      </motion.h2>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
        {results.map((article, index) => (
          <motion.a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.4 }}
            className="group block rounded-xl p-3 transition-all duration-300 hover:bg-accent hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 flex-col">
                <div className="mb-3 flex items-center gap-3">
                  <Avatar className="h-6 w-6 ring-2 ring-primary/20">
                    <AvatarImage
                      src={article.user.profile_image_90}
                      alt={article.user.name}
                    />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-accent to-primary text-primary-foreground">
                      {article.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-muted-foreground">
                    {article.user.name}
                  </span>
                </div>
                <motion.h3
                  className="mb-3 font-semibold leading-tight text-foreground group-hover:text-primary transition-colors duration-300"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {article.title}
                </motion.h3>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(article.published_timestamp), {
                    addSuffix: true,
                    locale: bn,
                  })}
                </p>
              </div>
              {article.cover_image && (
                <motion.div
                  className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted shadow-md sm:h-20 sm:w-20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={article.cover_image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 64px, 80px"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                </motion.div>
              )}
            </div>
            {index < results.length - 1 && (
              <motion.hr
                className="mt-4 border-border"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: 0.1 * index + 0.2 }}
              />
            )}
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
};
ArticleResultDisplay.displayName = "ArticleResultDisplay";
