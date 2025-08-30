"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  FileText,
  Search,
  Share2,
  Shield,
  Zap,
  Star,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Heart,
} from "lucide-react";

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const features = [
  {
    icon: FileText,
    title: "স্মার্ট নোট লেখা",
    description: "বাংলা ফন্টে সুন্দর নোট তৈরি করুন",
    color: "emerald",
  },
  {
    icon: Search,
    title: "দ্রুত খোঁজা",
    description: "যেকোনো নোট তাৎক্ষণিকভাবে খুঁজে নিন",
    color: "blue",
  },
  {
    icon: Share2,
    title: "সহজ শেয়ারিং",
    description: "নোট অন্যদের সাথে শেয়ার করুন",
    color: "purple",
  },
  {
    icon: Shield,
    title: "নিরাপত্তা",
    description: "পাসওয়ার্ড দিয়ে নোট সুরক্ষিত করুন",
    color: "orange",
  },
];

interface WelcomeScreenProps {
  onCreateFirstNote: () => void;
  onOpenTemplates: () => void;
}

export default function WelcomeScreen({
  onCreateFirstNote,
  onOpenTemplates,
}: WelcomeScreenProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-full blur-3xl" />
      </div>

      {/* Floating elements */}
      <motion.div
        variants={floatingVariants}
        animate="animate"
        className="absolute top-20 left-20 text-emerald-500/30"
      >
        <Lightbulb className="w-6 h-6" />
      </motion.div>

      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
        className="absolute top-40 right-32 text-teal-500/30"
      >
        <BookOpen className="w-8 h-8" />
      </motion.div>

      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "4s" }}
        className="absolute bottom-32 left-1/4 text-emerald-500/30"
      >
        <Heart className="w-5 h-5" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto px-6 py-20"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full px-6 py-2 mb-8"
          >
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              স্বাগতম mnr.world নোটস এ
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
            আপনার চিন্তাভাবনা
            <br />
            <span className="relative">
              সংরক্ষণ করুন
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
              />
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            বাংলা ভাষায় নোট লিখুন, সুন্দরভাবে সাজান এবং সহজেই খুঁজে নিন। আপনার
            সকল গুরুত্বপূর্ণ তথ্য এক জায়গায় রাখুন।
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full backdrop-blur-xl bg-white/50 dark:bg-white/5 border-white/20 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center"
                  >
                    <feature.icon className="w-6 h-6 text-emerald-600" />
                  </motion.div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onCreateFirstNote}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                প্রথম নোট তৈরি করুন
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={onOpenTemplates}
                variant="outline"
                size="lg"
                className="border-emerald-500/30 bg-white/50 dark:bg-white/5 backdrop-blur-xl hover:bg-emerald-500/10 hover:border-emerald-500/50 px-8 py-4 rounded-xl font-semibold group"
              >
                <Star className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                টেমপ্লেট দেখুন
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="flex flex-wrap justify-center gap-2"
          >
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            >
              বাংলা সাপোর্ট
            </Badge>
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            >
              অফলাইন কাজ
            </Badge>
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            >
              ফ্রি ব্যবহার
            </Badge>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
