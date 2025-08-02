"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HeatmapProps {
  data: { date: string; count: number }[];
  startDate: Date;
  endDate: Date;
}

const WritingHeatmap = ({ data, startDate, endDate }: HeatmapProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const days = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const dataMap = new Map(data.map(item => [item.date, item.count]));

  const getColor = (count: number) => {
    if (count === 0) return 'bg-muted/50';
    if (count < 50) return 'bg-primary/20';
    if (count < 100) return 'bg-primary/40';
    if (count < 200) return 'bg-primary/60';
    if (count < 400) return 'bg-primary/80';
    return 'bg-primary';
  };
  
  const weekDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];

  return (
    <motion.div 
      variants={cardVariants}
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CalendarDays className="h-8 w-8 text-primary" />
            <CardTitle className="text-lg font-semibold">রাইটিং হিটম্যাপ</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="flex gap-2">
               <div className="flex flex-col gap-2 text-xs text-muted-foreground mt-4">
                  {['রবি', 'বুধ', 'শনি'].map(day => (
                      <div key={day} className="h-3.5 flex items-center">{day}</div>
                  ))}
              </div>
              <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] grid-rows-7 gap-1 overflow-x-auto pb-2">
                {days.map(day => {
                  const dateString = day.toISOString().split('T')[0];
                  const count = dataMap.get(dateString) || 0;
                  const dayOfWeek = day.getDay();
                  const style = dayOfWeek > 0 ? { gridRowStart: dayOfWeek + 1 } : {};

                  return (
                    <Tooltip key={dateString} delayDuration={100}>
                      <TooltipTrigger asChild>
                        <motion.div
                          className={`w-3.5 h-3.5 rounded-sm ${getColor(count)}`}
                          style={style}
                           initial={{ opacity: 0, scale: 0.5 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ duration: 0.3, delay: Math.random() * 0.5, type: "spring", stiffness: 300 }}
                           whileHover={{ scale: 1.2, zIndex: 1, position: 'relative' }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{`${count} শব্দ`}</p>
                        <p className="text-muted-foreground">{day.toLocaleDateString('bn-BD')}</p>
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
