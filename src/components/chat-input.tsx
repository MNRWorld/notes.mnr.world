"use client";

import React, { useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  inputValue: string;
  onInputValueChange: (value: string) => void;
  onFormSubmit: () => void;
  isLoading: boolean;
}

export const ChatInput = ({
  inputValue,
  onInputValueChange,
  onFormSubmit,
  isLoading,
}: ChatInputProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${scrollHeight}px`;
    }
  }, [inputValue]);

  // Handle keyboard events and viewport changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleFocus = () => {
      // Clear any existing timeout
      if (timeoutId) clearTimeout(timeoutId);
      
      // Small delay to ensure keyboard is fully open
      timeoutId = setTimeout(() => {
        if (inputRef.current && containerRef.current) {
          // For iOS Safari, use scrollIntoView with different options
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
          
          if (isIOS) {
            // iOS specific handling
            inputRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
              inline: 'nearest'
            });
          } else {
            // Android and other mobile browsers
            inputRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      }, 300);
    };

    const handleBlur = () => {
      // Clear timeout on blur
      if (timeoutId) clearTimeout(timeoutId);
    };

    const handleResize = () => {
      // Handle viewport resize due to keyboard
      if (inputRef.current && document.activeElement === inputRef.current) {
        if (timeoutId) clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          if (inputRef.current && document.activeElement === inputRef.current) {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
            
            if (isIOS) {
              inputRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
              });
            } else {
              inputRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
              });
            }
          }
        }, 100);
      }
    };

    // Visual Viewport API for modern browsers
    const handleVisualViewportChange = () => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        if (timeoutId) clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          if (inputRef.current && document.activeElement === inputRef.current) {
            inputRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest'
            });
          }
        }, 150);
      }
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('focus', handleFocus);
      input.addEventListener('blur', handleBlur);
      window.addEventListener('resize', handleResize);
      
      // Visual Viewport API support
      if ('visualViewport' in window) {
        window.visualViewport!.addEventListener('resize', handleVisualViewportChange);
      }
      
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
        window.removeEventListener('resize', handleResize);
        
        if ('visualViewport' in window) {
          window.visualViewport!.removeEventListener('resize', handleVisualViewportChange);
        }
      };
    }
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        onFormSubmit();
      }
    }
  };

  const getPlaceholderText = () => {
    return "Gemini কে যেকোনো কিছু জিজ্ঞাসা করুন...";
  };

  return (
    <motion.footer
      ref={containerRef}
      className="shrink-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="mx-auto w-full max-w-4xl p-3 sm:p-4">
        <motion.div
          className="rounded-2xl border border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-300"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => onInputValueChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholderText()}
              className="min-h-[40px] max-h-48 flex-grow resize-none border-0 bg-transparent p-2 text-sm placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 sm:min-h-[44px] sm:text-base leading-relaxed"
              rows={1}
              disabled={isLoading}
            />
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              <Button
                size="icon"
                className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary disabled:opacity-50"
                onClick={onFormSubmit}
                disabled={!inputValue.trim() || isLoading}
                aria-label="বার্তা পাঠান"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Icons.Loader className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icons.Send className="h-5 w-5" />
                  </motion.div>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

ChatInput.displayName = "ChatInput";
