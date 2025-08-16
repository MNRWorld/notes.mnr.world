
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import React, { memo } from "react";

interface WordCountChartProps {
  data: { date: string; words: number }[];
}

const WordCountChartComponent = ({ data }: WordCountChartProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  };

  const maxWords = Math.max(...data.map((d) => d.words), 1);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, scale: 1.01, transition: { duration: 0.2 } }}
    >
      <Card className="h-full transition-shadow duration-200 hover:shadow-md">
        <CardHeader>
          <div className="flex items-center gap-4">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle className="text-base font-semibold">
              সাপ্তাহিক শব্দগণনা
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-around gap-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                <motion.div
                  className="w-full bg-secondary rounded-t-md hover:bg-primary/90 transition-colors cursor-pointer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: `${(item.words / maxWords) * 100}%`,
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  whileHover={{ scaleY: 1.05, y: -2 }}
                >
                  <div className="opacity-0 group-hover:opacity-100 text-xs text-primary-foreground text-center p-1 bg-primary rounded-md relative -top-8 transition-opacity duration-300">
                    {item.words}
                  </div>
                </motion.div>
                <span className="text-xs text-muted-foreground">
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const WordCountChart = memo(WordCountChartComponent);
export default WordCountChart;
