/**
 * Bengali Calendar Component
 * Display Bengali date information
 */

"use client";

import React from "react";
import { BengaliDate } from "@/lib/types";
import {
  getCurrentBengaliDate,
  formatBengaliDate,
  englishToBengaliNumber,
} from "@/lib/bengali-calendar";
import { Icons } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BengaliCalendarProps {
  bengaliDate?: BengaliDate;
  showSeason?: boolean;
  showGregorianDate?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BengaliCalendarDisplay({
  bengaliDate,
  showSeason = true,
  showGregorianDate = false,
  className,
  size = "md",
}: BengaliCalendarProps) {
  const date = bengaliDate || getCurrentBengaliDate();
  const today = new Date();

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Icons.Calendar
        className={cn(iconSizes[size], "text-muted-foreground")}
      />

      <div className="flex flex-col">
        <div className={cn("font-medium", sizeClasses[size])}>
          {englishToBengaliNumber(formatBengaliDate(date))}
        </div>

        {showSeason && (
          <Badge
            variant="secondary"
            className={cn("text-xs w-fit", size === "sm" && "text-[10px] px-1")}
          >
            {date.seasonName}
          </Badge>
        )}

        {showGregorianDate && (
          <div
            className={cn(
              "text-muted-foreground",
              size === "sm" ? "text-[10px]" : "text-xs",
            )}
          >
            {today.toLocaleDateString("bn-BD")}
          </div>
        )}
      </div>
    </div>
  );
}

interface BengaliCalendarWidgetProps {
  onDateSelect?: (date: BengaliDate) => void;
  selectedDate?: BengaliDate;
  className?: string;
}

export function BengaliCalendarWidget({
  onDateSelect,
  selectedDate,
  className,
}: BengaliCalendarWidgetProps) {
  const currentDate = getCurrentBengaliDate();

  return (
    <div className={cn("rounded-lg border p-4 bg-card", className)}>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">
          {englishToBengaliNumber(currentDate.monthName)}{" "}
          {englishToBengaliNumber(currentDate.year.toString())}
        </h3>
        <p className="text-sm text-muted-foreground">
          {currentDate.seasonName}
        </p>
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-primary mb-2">
          {englishToBengaliNumber(currentDate.day.toString())}
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          আজ, {formatBengaliDate(currentDate)}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>ঋতু:</span>
            <Badge variant="outline">{currentDate.seasonName}</Badge>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span>মাস:</span>
            <span>{currentDate.monthName}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span>সাল:</span>
            <span>{englishToBengaliNumber(currentDate.year.toString())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BengaliDatePickerProps {
  value?: BengaliDate;
  onChange?: (date: BengaliDate) => void;
  className?: string;
}

export function BengaliDatePicker({
  value,
  onChange,
  className,
}: BengaliDatePickerProps) {
  const currentDate = value || getCurrentBengaliDate();

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">বাংলা তারিখ</label>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">দিন</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={currentDate.day}
            onChange={(e) => {
              if (onChange) {
                onChange({
                  ...currentDate,
                  day: parseInt(e.target.value),
                });
              }
            }}
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                {englishToBengaliNumber(day.toString())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">মাস</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={currentDate.month}
            onChange={(e) => {
              if (onChange) {
                onChange({
                  ...currentDate,
                  month: parseInt(e.target.value),
                });
              }
            }}
          >
            {[
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
            ].map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-muted-foreground">সাল</label>
          <input
            type="number"
            className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
            value={currentDate.year}
            onChange={(e) => {
              if (onChange) {
                onChange({
                  ...currentDate,
                  year: parseInt(e.target.value) || currentDate.year,
                });
              }
            }}
          />
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center">
        {formatBengaliDate(currentDate)} • {currentDate.seasonName}
      </div>
    </div>
  );
}
