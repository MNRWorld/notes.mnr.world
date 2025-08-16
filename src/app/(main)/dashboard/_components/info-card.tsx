
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React, { memo } from "react";

interface InfoCardProps {
  title: string;
  content: string | React.ReactNode;
  icon: React.ElementType;
  footer?: string;
  className?: string;
}

function InfoCardComponent({
  title,
  content,
  icon: Icon,
  footer,
  className,
}: InfoCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="h-full"
      whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className={cn("h-full transition-shadow duration-200 hover:shadow-md", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold md:text-2xl">{content}</div>
          {footer && <p className="text-xs text-muted-foreground">{footer}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

const InfoCard = memo(InfoCardComponent);
export default InfoCard;
