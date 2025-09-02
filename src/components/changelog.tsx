/**
 * Changelog Component
 * Documents all the new features and improvements
 */

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    type: 'feature' | 'improvement' | 'fix' | 'breaking';
    title: string;
    description: string;
    icon: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '২০২৪-০১-১৫',
    type: 'major',
    changes: [
      {
        type: 'feature',
        title: 'অঙ্কন টুল',
        description: 'ক্যানভাস-ভিত্তিক অঙ্কন টুল যোগ করা হয়েছে। এখন আপনি নোটে ছবি এবং ডায়াগ্রাম আঁকতে পারবেন।',
        icon: 'Feather'
      },
      {
        type: 'feature',
        title: 'গণিতের সূত্র সাপোর্ট',
        description: 'LaTeX/KaTeX সাপোর্ট যোগ করা হয়েছে। একাডেমিক নোটের জন্য গণিতের সূত্র লিখতে পারবেন।',
        icon: 'Calculator'
      },
      {
        type: 'feature',
        title: 'মার্কডাউন এক্সপোর্ট/ইম্পোর্ট',
        description: 'মার্কডাউন ফরম্যাটে নোট এক্সপোর্ট এবং ইম্পোর্ট করার সুবিধা।',
        icon: 'FileText'
      },
      {
        type: 'feature',
        title: 'বাংলা ক্যালেন্ডার ইন্টিগ্রেশন',
        description: 'বাংলা তারিখ এবং ঋতু তথ্য সহ নোট তৈরি করার সুবিধা।',
        icon: 'Calendar'
      },
      {
        type: 'feature',
        title: 'ভার্সন কন্ট্রোল সিস্টেম',
        description: 'Git-এর মতো ভার্সন হিস্ট্রি এবং ব্র্যাঞ্চিং সিস্টেম যোগ করা হয়েছে।',
        icon: 'History'
      },
      {
        type: 'feature',
        title: 'উন্নত গোপনীয়তা মোড',
        description: 'এনক্রিপ্টেড এবং গোপনীয় নোট তৈরি করার সুবিধা।',
        icon: 'Eye'
      },
      {
        type: 'feature',
        title: 'কাজ ব্যবস্থাপনা',
        description: 'নোট থেকে কাজের তালিকা তৈরি এবং ট্র্যাক করার সুবিধা।',
        icon: 'CheckSquare'
      },
      {
        type: 'feature',
        title: 'ফাইল সংযুক্তি',
        description: 'ছবি, PDF, অডিও ফাইল নোটে সংযুক্ত করার সুবিধা।',
        icon: 'File'
      },
      {
        type: 'improvement',
        title: 'উন্নত PWA সাপোর্ট',
        description: 'অফলাইন ক্যাশিং এবং ব্যাকগ্রাউন্ড সিঙ্ক উন্নত করা হয়েছে।',
        icon: 'Bolt'
      }
    ]
  },
  {
    version: '1.5.0',
    date: '২০২৩-১২-১০',
    type: 'minor',
    changes: [
      {
        type: 'improvement',
        title: 'পারফরমেন্স উন্নতি',
        description: 'অ্যাপ লোডিং গতি ৫০% বৃদ্ধি পেয়েছে।',
        icon: 'Rocket'
      },
      {
        type: 'improvement',
        title: 'UI/UX উন্নতি',
        description: 'আরও সুন্দর এবং ব্যবহারবান্ধব ইন্টারফেস।',
        icon: 'Brush'
      },
      {
        type: 'fix',
        title: 'বাগ ফিক্স',
        description: 'বিভিন্ন ছোটখাটো সমস্যা সমাধান করা হয়েছে।',
        icon: 'Bug'
      }
    ]
  }
];

const getTypeColor = (type: ChangelogEntry['type']) => {
  switch (type) {
    case 'major': return 'bg-red-500';
    case 'minor': return 'bg-yellow-500';
    case 'patch': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getChangeTypeColor = (type: string) => {
  switch (type) {
    case 'feature': return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'improvement': return 'bg-green-500/10 text-green-700 border-green-200';
    case 'fix': return 'bg-orange-500/10 text-orange-700 border-orange-200';
    case 'breaking': return 'bg-red-500/10 text-red-700 border-red-200';
    default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
};

export function Changelog() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">📝 পরিবর্তনের ইতিহাস</h2>
        <p className="text-muted-foreground">
          আমার নোট অ্যাপের সকল আপডেট এবং উন্নতির বিস্তারিত তালিকা
        </p>
      </div>

      <div className="space-y-6">
        {changelog.map((entry, index) => (
          <motion.div
            key={entry.version}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getTypeColor(entry.type)}`} />
                    <span>ভার্সন {entry.version}</span>
                    <Badge variant="outline">{entry.type}</Badge>
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {entry.date}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {entry.changes.map((change, changeIndex) => {
                    const IconComponent = (Icons as any)[change.icon];
                    
                    return (
                      <motion.div
                        key={changeIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (index * 0.1) + (changeIndex * 0.05) }}
                        className="flex gap-3 p-3 rounded-lg border bg-muted/20"
                      >
                        <div className="flex-shrink-0">
                          {IconComponent && (
                            <IconComponent className="h-5 w-5 mt-0.5 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{change.title}</h4>
                            <Badge 
                              variant="outline" 
                              className={getChangeTypeColor(change.type)}
                            >
                              {change.type === 'feature' && 'নতুন ফিচার'}
                              {change.type === 'improvement' && 'উন্নতি'}
                              {change.type === 'fix' && 'সমাধান'}
                              {change.type === 'breaking' && 'ভাঙা পরিবর্তন'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {change.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Changelog;
