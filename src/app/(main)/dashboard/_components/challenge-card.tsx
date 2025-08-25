"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface ChallengeCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
}

function ChallengeCardComponent({
  icon: Icon,
  title,
  description,
  currentValue,
  targetValue,
  unit,
}: ChallengeCardProps) {
  const progress = Math.min((currentValue / targetValue) * 100, 100);
  const isCompleted = progress >= 100;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
    >
      <Card
        className={cn(
          "h-full transition-all duration-300 hover:shadow-lg",
          isCompleted && "bg-primary/10 border-primary/50",
        )}
      >
        <CardHeader>
          <div className="flex items-start gap-4">
            <Icon
              className={cn(
                "h-6 w-6 mt-1",
                isCompleted ? "text-primary" : "text-muted-foreground",
              )}
            />
            <div className="flex-1">
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            {isCompleted && (
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
              >
                <CheckCircle className="h-6 w-6 text-green-500" />
              </motion.div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <div className="mb-2 flex justify-between text-xs font-medium">
              <span className="text-primary">
                {currentValue.toLocaleString()} / {targetValue.toLocaleString()}{" "}
                {unit}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
ChallengeCardComponent.displayName = "ChallengeCardComponent";

const ChallengeCard = memo(ChallengeCardComponent);
export default ChallengeCard;
