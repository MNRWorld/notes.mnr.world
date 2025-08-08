
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ChallengeCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
}

function ChallengeCard({
  icon: Icon,
  title,
  description,
  currentValue,
  targetValue,
  unit,
}: ChallengeCardProps) {
  const progress = Math.min((currentValue / targetValue) * 100, 100);

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2, boxShadow: "0px 4px 15px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-start gap-4">
            <Icon className="h-6 w-6 text-primary mt-1" />
            <div className="flex-1">
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
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

export default ChallengeCard;
