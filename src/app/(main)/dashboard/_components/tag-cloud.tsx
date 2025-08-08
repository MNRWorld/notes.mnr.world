"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud } from "lucide-react";

interface TagCloudProps {
  tags: { [key: string]: number };
}

const TagCloud = ({ tags }: TagCloudProps) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const sortedTags = Object.entries(tags).sort(([, a], [, b]) => b - a);
  const maxCount = Math.max(...Object.values(tags));

  const getFontSize = (count: number) => {
    if (maxCount <= 1) return "text-sm";
    const size = 12 + (count / maxCount) * 16;
    return `text-[${Math.max(12, Math.min(28, size))}px]`;
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Cloud className="h-8 w-8 text-primary" />
            <CardTitle className="text-lg font-semibold">
              ট্যাগ ক্লাউড
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {sortedTags.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {sortedTags.map(([tag, count]) => (
                <motion.div
                  key={tag}
                  whileHover={{
                    scale: 1.1,
                    rotate: Math.random() > 0.5 ? 2 : -2,
                  }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Badge
                    variant="secondary"
                    className={`${getFontSize(
                      count,
                    )} transition-all duration-300`}
                  >
                    {tag} ({count})
                  </Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              কোনো ট্যাগ ব্যবহৃত হয়নি।
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TagCloud;
