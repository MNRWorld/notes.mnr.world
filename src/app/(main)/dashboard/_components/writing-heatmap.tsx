
"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

interface HeatmapProps {
  data: { date: string; count: number }[];
  startDate: Date;
  endDate: Date;
}

const WritingHeatmap = ({ data, startDate, endDate }: HeatmapProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const days = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const dataMap = new Map(data.map((item) => [item.date, item.count]));

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/50";
    if (count < 50) return "bg-primary/20";
    if (count < 100) return "bg-primary/40";
    if (count < 200) return "bg-primary/60";
    if (count < 400) return "bg-primary/80";
    return "bg-primary";
  };

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CalendarDays className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <CardTitle className="text-base sm:text-lg font-semibold">
              রাইটিং হিটম্যাপ
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="flex gap-1 sm:gap-2">
              <div className="flex flex-col text-[10px] sm:text-xs text-muted-foreground pt-4 justify-between">
                {["রবি", "বুধ", "শনি"].map((day) => (
                  <div key={day} className="h-3 sm:h-3.5 flex items-center">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-px sm:gap-1 overflow-x-auto pb-2">
                {days.map((day, i) => {
                  const dateString = day.toISOString().split("T")[0];
                  const count = dataMap.get(dateString) || 0;
                  const dayOfWeek = day.getDay();
                  const style =
                    dayOfWeek > 0 ? { gridRowStart: dayOfWeek + 1 } : {};

                  return (
                    <Tooltip key={dateString} delayDuration={100}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm ${getColor(count)}`}
                          style={style}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.2,
                            delay: i * 0.005,
                          }}
                          whileHover={{
                            scale: 1.2,
                            zIndex: 1,
                            position: "relative",
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{`${count} শব্দ`}</p>
                        <p className="text-muted-foreground">
                          {isClient
                            ? day.toLocaleDateString("bn-BD")
                            : day.toISOString().split("T")[0]}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WritingHeatmap;
