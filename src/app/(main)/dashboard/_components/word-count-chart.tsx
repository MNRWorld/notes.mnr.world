"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface WordCountChartProps {
  data: { date: string; words: number }[];
}

const WordCountChart = ({ data }: WordCountChartProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const maxWords = Math.max(...data.map(d => d.words), 1);

  return (
    <motion.div 
      variants={cardVariants}
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <CardTitle className="text-lg font-semibold">সাপ্তাহিক শব্দগণনা</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-around gap-2">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <motion.div
                  className="w-full bg-secondary rounded-t-md hover:bg-primary transition-colors cursor-pointer"
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.words / maxWords) * 100}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
                  whileHover={{ scaleY: 1.05 }}
                >
                  <div className="opacity-0 group-hover:opacity-100 text-xs text-primary-foreground text-center p-1 bg-primary rounded-md relative -top-8 transition-opacity duration-300">
                    {item.words}
                  </div>
                </motion.div>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WordCountChart;
