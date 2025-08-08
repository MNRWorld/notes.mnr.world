
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const sortedTags = Object.entries(tags).sort(([, a], [, b]) => b - a);
  const maxCount = Math.max(...Object.values(tags));

  const getFontSizeClass = (count: number) => {
    if (maxCount <= 1) return "text-xs sm:text-sm";
    const sizeRatio = count / maxCount;
    if (sizeRatio > 0.8) return "text-lg sm:text-xl";
    if (sizeRatio > 0.5) return "text-base sm:text-lg";
    if (sizeRatio > 0.2) return "text-sm sm:text-base";
    return "text-xs sm:text-sm";
  };

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2, boxShadow: "0px 4px 15px rgba(0,0,0,0.08)" }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Cloud className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <CardTitle className="text-base sm:text-lg font-semibold">
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
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge
                    variant="secondary"
                    className={`${getFontSizeClass(
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
