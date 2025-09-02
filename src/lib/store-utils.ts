"use client";

import { toast } from "sonner";
import { hapticFeedback } from "@/lib/utils";

// Common store operation wrapper
export async function withStoreOperation<T>(
  operation: () => Promise<T>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    haptic?: "light" | "medium" | "heavy";
    silent?: boolean;
  } = {},
): Promise<T | undefined> {
  const {
    successMessage,
    errorMessage = "অপারেশন সম্পন্ন করা যায়নি।",
    haptic = "medium",
    silent = false,
  } = options;

  try {
    const result = await operation();

    if (!silent) {
      if (haptic) hapticFeedback(haptic);
      if (successMessage) toast.success(successMessage);
    }

    return result;
  } catch (error) {
    if (!silent) {
      toast.error(errorMessage);
    }
    console.error("Store operation failed:", error);
    return undefined;
  }
}

// Common state update patterns
export const stateUpdaters = {
  // Add item to array
  addItem: <T extends { id: string }>(items: T[], newItem: T): T[] => [
    newItem,
    ...items,
  ],

  // Update item in array
  updateItem: <T extends { id: string }>(
    items: T[],
    id: string,
    updates: Partial<T>,
  ): T[] =>
    items.map((item) => (item.id === id ? { ...item, ...updates } : item)),

  // Remove item from array
  removeItem: <T extends { id: string }>(items: T[], id: string): T[] =>
    items.filter((item) => item.id !== id),

  // Move item between arrays
  moveItem: <T extends { id: string }>(
    fromArray: T[],
    toArray: T[],
    id: string,
    updates: Partial<T> = {},
  ): { from: T[]; to: T[] } => {
    const item = fromArray.find((item) => item.id === id);
    if (!item) return { from: fromArray, to: toArray };

    const updatedItem = { ...item, ...updates };
    return {
      from: fromArray.filter((item) => item.id !== id),
      to: [updatedItem, ...toArray],
    };
  },

  // Filter multiple arrays
  removeFromAll: <T extends { id: string }>(
    arrays: Record<string, T[]>,
    id: string,
  ): Record<string, T[]> => {
    const result: Record<string, T[]> = {};
    for (const [key, array] of Object.entries(arrays)) {
      result[key] = array.filter((item) => item.id !== id);
    }
    return result;
  },

  // Sort array by property
  sortBy: <T>(
    items: T[],
    key: keyof T,
    order: "asc" | "desc" = "desc",
  ): T[] => {
    return [...items].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return order === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  },
};

// Common validation patterns
export const validators = {
  required: (value: any, fieldName: string): string | null => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return `${fieldName} আবশ্যক।`;
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value.length < min) {
      return `${fieldName} কমপক্ষে ${min} অক্ষরের হতে হবে।`;
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (value.length > max) {
      return `${fieldName} সর্বোচ্চ ${max} অক্ষরের হতে পারে।`;
    }
    return null;
  },

  email: (value: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "সঠিক ইমেইল ঠিকানা দিন।";
    }
    return null;
  },
};

// Common loading state manager
export class LoadingManager {
  private static instance: LoadingManager;
  private loadingStates: Map<string, boolean> = new Map();
  private listeners: Map<string, Set<(loading: boolean) => void>> = new Map();

  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  setLoading(key: string, loading: boolean): void {
    this.loadingStates.set(key, loading);
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach((listener) => listener(loading));
    }
  }

  isLoading(key: string): boolean {
    return this.loadingStates.get(key) || false;
  }

  subscribe(key: string, listener: (loading: boolean) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }
}

// Debounced operation helper
export function createDebouncedOperation<T extends any[]>(
  fn: (...args: T) => Promise<void>,
  delay: number = 300,
) {
  let timeoutId: NodeJS.Timeout;

  return (...args: T): Promise<void> => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          await fn(...args);
          resolve();
        } catch (error) {
          console.error("Debounced operation failed:", error);
          resolve();
        }
      }, delay);
    });
  };
}

// Batch operation helper
export async function batchOperations<T>(
  items: T[],
  operation: (item: T) => Promise<void>,
  batchSize: number = 10,
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(operation));
  }
}
