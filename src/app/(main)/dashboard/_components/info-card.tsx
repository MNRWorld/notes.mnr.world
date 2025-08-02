"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InfoCardProps {
  title: string;
  content: string | React.ReactNode;
  icon: React.ElementType;
  footer?: string;
  className?: string;
}

function InfoCard({ title, content, icon: Icon, footer, className }: InfoCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <motion.div 
      variants={cardVariants} 
      className="h-full"
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={`h-full ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{content}</div>
          {footer && <p className="text-xs text-muted-foreground">{footer}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default InfoCard;
