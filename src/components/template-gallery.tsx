"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Briefcase, 
  Calendar, 
  Code, 
  Coffee, 
  Heart, 
  Lightbulb, 
  Target,
  Zap,
  Star,
  Clock,
  Users
} from "lucide-react";
import { NoteTemplate } from "@/lib/templates";

interface EnhancedTemplate extends NoteTemplate {
  category: string;
  preview: string;
  color: string;
  popularity?: number;
}

const enhancedTemplates: EnhancedTemplate[] = [
  {
    id: "daily-journal",
    title: "দৈনিক জার্নাল",
    description: "আপনার দিনের ঘটনা এবং চিন্তাভাবনা লিখুন",
    content: {
      blocks: [
        {
          type: "header",
          data: { text: "আজকের তারিখ: " + new Date().toLocaleDateString('bn-BD'), level: 2 }
        },
        {
          type: "header",
          data: { text: "আজকের মুড 😊", level: 3 }
        },
        {
          type: "paragraph",
          data: { text: "" }
        },
        {
          type: "header",
          data: { text: "আজকের হাইলাইট", level: 3 }
        },
        {
          type: "list",
          data: { style: "unordered", items: ["", "", ""] }
        },
        {
          type: "header",
          data: { text: "কৃতজ্ঞতা", level: 3 }
        },
        {
          type: "paragraph",
          data: { text: "আজ আমি কৃতজ্ঞ..." }
        }
      ]
    },
    tags: ["জার্নাল", "দৈনিক"],
    icon: "BookOpen",
    category: "Personal",
    preview: "দৈনিক জার্নাল লেখার জন্য একটি সুন্দর টেমপ্লেট...",
    color: "emerald",
    popularity: 95
  },
  {
    id: "meeting-notes",
    title: "মিটিং নোটস",
    description: "মিটিং এর সম্পূর্ণ তথ্য সংরক্ষণ করুন",
    content: {
      blocks: [
        {
          type: "header",
          data: { text: "মিটিং: [বিষয়]", level: 1 }
        },
        {
          type: "paragraph",
          data: { text: "📅 তারিখ: " + new Date().toLocaleDateString('bn-BD') }
        },
        {
          type: "paragraph",
          data: { text: "🕐 সময়: " }
        },
        {
          type: "paragraph",
          data: { text: "👥 অংশগ্রহণকারী: " }
        },
        {
          type: "header",
          data: { text: "আলোচ্য বিষয়", level: 2 }
        },
        {
          type: "list",
          data: { style: "ordered", items: ["", "", ""] }
        },
        {
          type: "header",
          data: { text: "সিদ্ধান্ত", level: 2 }
        },
        {
          type: "list",
          data: { style: "unordered", items: [""] }
        },
        {
          type: "header",
          data: { text: "পরবর্তী পদক্ষেপ", level: 2 }
        },
        {
          type: "list",
          data: { style: "unordered", items: [""] }
        }
      ]
    },
    tags: ["মিটিং", "কাজ"],
    icon: "Users",
    category: "Work",
    preview: "মিটিং এর সব গুরুত্বপূর্ণ তথ্য একসাথে...",
    color: "blue",
    popularity: 88
  },
  {
    id: "project-plan",
    title: "প্রকল্প পরিকল্পনা",
    description: "আপনার প্রকল্পের বিস্তারিত পরিকল্পনা করুন",
    content: {
      blocks: [
        {
          type: "header",
          data: { text: "প্রকল্প: [নাম]", level: 1 }
        },
        {
          type: "header",
          data: { text: "উদ্দেশ্য", level: 2 }
        },
        {
          type: "paragraph",
          data: { text: "" }
        },
        {
          type: "header",
          data: { text: "টাইমলাইন", level: 2 }
        },
        {
          type: "list",
          data: { style: "ordered", items: ["পর্যায় ১:", "পর্যায় ২:", "পর্যায় ৩:"] }
        },
        {
          type: "header",
          data: { text: "সম্পদ", level: 2 }
        },
        {
          type: "list",
          data: { style: "unordered", items: [""] }
        },
        {
          type: "header",
          data: { text: "ঝুঁকি", level: 2 }
        },
        {
          type: "list",
          data: { style: "unordered", items: [""] }
        }
      ]
    },
    tags: ["প্রকল্প", "পরিকল্পনা"],
    icon: "Target",
    category: "Work",
    preview: "প্রকল্প পরিকল্পনার জন্য সম্পূর্ণ গাইড...",
    color: "purple",
    popularity: 82
  },
  {
    id: "recipe",
    title: "রেসিপি",
    description: "আপনার প্রিয় রেসিপি সংরক্ষণ করুন",
    content: {
      blocks: [
        {
          type: "header",
          data: { text: "রেসিপি: [নাম]", level: 1 }
        },
        {
          type: "paragraph",
          data: { text: "🍽️ পরিবেশন: __ জন" }
        },
        {
          type: "paragraph",
          data: { text: "⏱️ সময়: __ মিনিট" }
        },
        {
          type: "header",
          data: { text: "উপকরণ", level: 2 }
        },
        {
          type: "list",
          data: { style: "unordered", items: ["", "", ""] }
        },
        {
          type: "header",
          data: { text: "প্রস্তুতি প্রণালী", level: 2 }
        },
        {
          type: "list",
          data: { style: "ordered", items: ["", "", ""] }
        },
        {
          type: "header",
          data: { text: "টিপস", level: 2 }
        },
        {
          type: "paragraph",
          data: { text: "" }
        }
      ]
    },
    tags: ["রেসিপি", "খাবার"],
    icon: "Coffee",
    category: "Lifestyle",
    preview: "সুস্বাদু খাবারের রেসিপি সংরক্ষণ করুন...",
    color: "orange",
    popularity: 76
  },
  {
    id: "book-review",
    title: "বই রিভিউ",
    description: "পড়া বইয়ের রিভিউ এবং নোটস",
    content: {
      blocks: [
        {
          type: "header",
          data: { text: "বই: [নাম]", level: 1 }
        },
        {
          type: "paragraph",
          data: { text: "📖 লেখক: " }
        },
        {
          type: "paragraph",
          data: { text: "⭐ রেটিং: __/৫" }
        },
        {
          type: "header",
          data: { text: "সারাংশ", level: 2 }
        },
        {
          type: "paragraph",
          data: { text: "" }
        },
        {
          type: "header",
          data: { text: "মূল পয়েন্ট", level: 2 }
        },
        {
          type: "list",
          data: { style: "unordered", items: ["", "", ""] }
        },
        {
          type: "header",
          data: { text: "প্রিয় উক্তি", level: 2 }
        },
        {
          type: "quote",
          data: { text: "" }
        },
        {
          type: "header",
          data: { text: "চূড়ান্ত মন্তব্য", level: 2 }
        },
        {
          type: "paragraph",
          data: { text: "" }
        }
      ]
    },
    tags: ["বই", "রিভিউ"],
    icon: "BookOpen",
    category: "Learning",
    preview: "পড়া বইয়ের রিভিউ এবং গুরুত্বপূর্ণ পয়েন্ট...",
    color: "indigo",
    popularity: 71
  },
  {
    id: "workout-plan",
    title: "ওয়ার্কআউট প্ল্যান",
    description: "আপনার ব্যায়ামের রুটিন পরিকল্পনা করুন",
    content: {
      blocks: [
        {
          type: "header",
          data: { text: "ওয়ার্কআউট: [তারিখ]", level: 1 }
        },
        {
          type: "paragraph",
          data: { text: "💪 লক্ষ্য: " }
        },
        {
          type: "paragraph",
          data: { text: "⏱️ সময়: __ মিনিট" }
        },
        {
          type: "header",
          data: { text: "ওয়ার্ম-আপ (৫ মিনিট)", level: 2 }
        },
        {
          type: "list",
          data: { style: "unordered", items: ["", ""] }
        },
        {
          type: "header",
          data: { text: "মূল ব্যায়াম", level: 2 }
        },
        {
          type: "list",
          data: { style: "unordered", items: ["", "", ""] }
        },
        {
          type: "header",
          data: { text: "কুল ডাউন", level: 2 }
        },
        {
          type: "list",
          data: { style: "unordered", items: ["", ""] }
        },
        {
          type: "header",
          data: { text: "নোটস", level: 2 }
        },
        {
          type: "paragraph",
          data: { text: "" }
        }
      ]
    },
    tags: ["ব্যায়াম", "স্বাস্থ্য"],
    icon: "Zap",
    category: "Health",
    preview: "দৈনিক ব্যায়ামের জন্য পরিকল্পিত রুটিন...",
    color: "red",
    popularity: 68
  }
];

const categories = [
  { id: "all", name: "সব", icon: Star },
  { id: "Personal", name: "ব্যক্তিগত", icon: Heart },
  { id: "Work", name: "কাজ", icon: Briefcase },
  { id: "Learning", name: "শিক্ষা", icon: BookOpen },
  { id: "Lifestyle", name: "জীবনযাত্রা", icon: Coffee },
  { id: "Health", name: "স্বাস্থ্য", icon: Zap }
];

interface TemplateGalleryProps {
  onSelectTemplate: (template: NoteTemplate) => void;
  onClose: () => void;
}

export default function TemplateGallery({ onSelectTemplate, onClose }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = enhancedTemplates.filter(template => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedTemplates = filteredTemplates.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
    >
      <div className="fixed inset-4 glass-modal rounded-2xl overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 glass-sidebar p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">টেমপ্লেট গ্যালারি</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
            </div>
            
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-background/50 border border-border rounded-lg"
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-primary/20 text-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {category.id === "all" 
                        ? enhancedTemplates.length 
                        : enhancedTemplates.filter(t => t.category === category.id).length
                      }
                    </Badge>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                {selectedCategory === "all" ? "সব টেমপ্লেট" : categories.find(c => c.id === selectedCategory)?.name}
              </h3>
              <p className="text-muted-foreground">
                {sortedTemplates.length} টি টেমপ্লেট পাওয়া গেছে
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTemplates.map((template, index) => {
                const Icon = (LucideIcons as any)[template.icon] || BookOpen;
                
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  >
                    <Card className="h-full glass-card-enhanced hover-glow cursor-pointer" 
                          onClick={() => onSelectTemplate(template)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`h-10 w-10 rounded-lg bg-${template.color}-500/20 flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 text-${template.color}-500`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{template.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {categories.find(c => c.id === template.category)?.name}
                              </Badge>
                              {template.popularity && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Star className="h-3 w-3 fill-current text-yellow-500" />
                                  <span>{template.popularity}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {template.description}
                        </p>
                        
                        <p className="text-xs text-muted-foreground/70 line-clamp-2">
                          {template.preview}
                        </p>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-1">
                            {template.tags?.slice(0, 2).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <Clock className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {sortedTemplates.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">কোনো টেমপ্লেট পাওয়া যায়নি</h3>
                <p className="text-muted-foreground">
                  অন্য ক্যাটাগরি বা সার্চ টার্ম চেষ্টা করুন
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
