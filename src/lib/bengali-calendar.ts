/**
 * Bengali Calendar Utility
 * Converts Gregorian dates to Bengali calendar system
 */

import { BengaliDate } from "./types";

// Bengali month names
const BENGALI_MONTHS = [
  "বৈশাখ",
  "জ্যৈষ্ঠ",
  "আষাঢ়",
  "শ্রাবণ",
  "ভাদ্র",
  "আশ্বিন",
  "কার্তিক",
  "অগ্রহায়ণ",
  "পৌষ",
  "মাঘ",
  "ফাল্গুন",
  "চৈত্র",
];

// Bengali season names
const BENGALI_SEASONS = [
  "গ্রীষ্ম",
  "গ্রীষ্ম",
  "বর্ষা",
  "বর্ষা",
  "শরৎ",
  "শরৎ",
  "হেমন্ত",
  "হেমন্ত",
  "শীত",
  "শীত",
  "বসন্ত",
  "বসন্ত",
];

// Days in each Bengali month (leap year adjustments not implemented for simplicity)
const BENGALI_MONTH_DAYS = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];

/**
 * Convert Gregorian date to Bengali date
 * Simplified conversion based on standard Bengali calendar
 */
export function gregorianToBengali(date: Date): BengaliDate {
  // Bengali year starts from April 14th (approximately)
  // This is a simplified conversion
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  let bengaliYear = year - 593; // Bengali era offset
  let bengaliMonth = month - 3; // April is month 0 in Bengali calendar
  let bengaliDay = day;

  if (bengaliMonth < 0) {
    bengaliMonth += 12;
    bengaliYear -= 1;
  }

  // Adjust for different month starts (simplified)
  if (day < 15 && month === 3) {
    // April adjustment
    bengaliMonth = 11; // Previous month
    bengaliYear -= 1;
    bengaliDay = day + 16;
  }

  return {
    day: bengaliDay,
    month: bengaliMonth,
    year: bengaliYear,
    monthName: BENGALI_MONTHS[bengaliMonth],
    seasonName: BENGALI_SEASONS[bengaliMonth],
  };
}

/**
 * Format Bengali date as string
 */
export function formatBengaliDate(bengaliDate: BengaliDate): string {
  return `${bengaliDate.day} ${bengaliDate.monthName}, ${bengaliDate.year}`;
}

/**
 * Get current Bengali date
 */
export function getCurrentBengaliDate(): BengaliDate {
  return gregorianToBengali(new Date());
}

/**
 * Convert Bengali numerals to English
 */
export function bengaliToEnglishNumber(bengaliNum: string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = bengaliNum;
  for (let i = 0; i < bengaliDigits.length; i++) {
    result = result.replace(
      new RegExp(bengaliDigits[i], "g"),
      englishDigits[i],
    );
  }
  return result;
}

/**
 * Convert English numerals to Bengali
 */
export function englishToBengaliNumber(englishNum: string): string {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = englishNum;
  for (let i = 0; i < englishDigits.length; i++) {
    result = result.replace(
      new RegExp(englishDigits[i], "g"),
      bengaliDigits[i],
    );
  }
  return result;
}
