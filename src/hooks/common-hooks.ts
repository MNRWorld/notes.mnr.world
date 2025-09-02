"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { withStoreOperation, type validators } from "@/lib/store-utils";
import { hapticFeedback } from "@/lib/utils";

// Enhanced loading state hook with multiple operations
export function useMultipleLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {},
  );

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: loading }));
  }, []);

  const isLoading = useCallback(
    (key: string) => {
      return loadingStates[key] || false;
    },
    [loadingStates],
  );

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  const createHandler = useCallback(
    <T extends any[]>(
      key: string,
      fn: (...args: T) => Promise<void>,
      options?: {
        successMessage?: string;
        errorMessage?: string;
        haptic?: "light" | "medium" | "heavy";
      },
    ) => {
      return async (...args: T) => {
        setLoading(key, true);
        try {
          await withStoreOperation(() => fn(...args), options);
        } finally {
          setLoading(key, false);
        }
      };
    },
    [setLoading],
  );

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    createHandler,
  };
}

// Form validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<
    Record<keyof T, Array<(value: any) => string | null>>
  >,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touchedFields, setTouchedFields] = useState<
    Partial<Record<keyof T, boolean>>
  >({});

  const setValue = useCallback(
    (key: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [key]: value }));

      // Clear error when user starts typing
      if (errors[key]) {
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      }
    },
    [errors],
  );

  const setTouched = useCallback((key: keyof T) => {
    setTouchedFields((prev) => ({ ...prev, [key]: true }));
  }, []);

  const validate = useCallback(
    (key?: keyof T) => {
      const keysToValidate = key
        ? [key]
        : (Object.keys(validationRules) as Array<keyof T>);
      const newErrors: Partial<Record<keyof T, string>> = {};

      keysToValidate.forEach((fieldKey) => {
        const rules = validationRules[fieldKey];
        if (rules) {
          const value = values[fieldKey];
          for (const rule of rules) {
            const error = rule(value);
            if (error) {
              newErrors[fieldKey] = error;
              break;
            }
          }
        }
      });

      if (key) {
        setErrors((prev) => ({ ...prev, [key]: newErrors[key] }));
        return !newErrors[key];
      } else {
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      }
    },
    [values, validationRules],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedFields({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched: touchedFields,
    setValue,
    setTouched,
    validate,
    reset,
    isValid,
  };
}

// Async state management hook
export function useAsyncState<T>(asyncFn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => execute(), [execute]);

  return {
    data,
    loading,
    error,
    refetch,
    execute,
  };
}

// Local storage hook with sync
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window !== "undefined") {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

// Optimistic updates hook
export function useOptimisticUpdate<T extends { id: string }>(
  items: T[],
  updateFn: (id: string, updates: Partial<T>) => Promise<void>,
) {
  const [optimisticItems, setOptimisticItems] = useState(items);
  const rollbackRef = useRef<Map<string, T>>(new Map());

  useEffect(() => {
    setOptimisticItems(items);
  }, [items]);

  const optimisticUpdate = useCallback(
    async (
      id: string,
      updates: Partial<T>,
      options?: {
        successMessage?: string;
        errorMessage?: string;
      },
    ) => {
      const originalItem = optimisticItems.find((item) => item.id === id);
      if (!originalItem) return;

      // Store original for rollback
      rollbackRef.current.set(id, originalItem);

      // Apply optimistic update
      setOptimisticItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      );

      try {
        await updateFn(id, updates);
        rollbackRef.current.delete(id);

        if (options?.successMessage) {
          toast.success(options.successMessage);
        }
      } catch (error) {
        // Rollback on error
        const original = rollbackRef.current.get(id);
        if (original) {
          setOptimisticItems((prev) =>
            prev.map((item) => (item.id === id ? original : item)),
          );
          rollbackRef.current.delete(id);
        }

        toast.error(options?.errorMessage || "আপডেট করা যায়নি।");
        throw error;
      }
    },
    [optimisticItems, updateFn],
  );

  return {
    optimisticItems,
    optimisticUpdate,
  };
}

// Keyboard shortcuts hook
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const modifierPrefix = [
        ctrlKey || metaKey ? "cmd" : "",
        shiftKey ? "shift" : "",
        altKey ? "alt" : "",
      ]
        .filter(Boolean)
        .join("+");

      const shortcutKey = modifierPrefix
        ? `${modifierPrefix}+${key.toLowerCase()}`
        : key.toLowerCase();

      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey]();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Intersection observer hook
export function useIntersectionObserver(
  threshold: number = 0.1,
  rootMargin: string = "0px",
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold, rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold, rootMargin]);

  return [setElement, isIntersecting] as const;
}

// Previous value hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}

// Toggle hook
export function useToggle(
  initialValue: boolean = false,
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((prev) => !prev), []);
  const setToggle = useCallback((newValue: boolean) => setValue(newValue), []);

  return [value, toggle, setToggle];
}

// Counter hook
export function useCounter(initialValue: number = 0, step: number = 1) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => setCount((prev) => prev + step), [step]);
  const decrement = useCallback(() => setCount((prev) => prev - step), [step]);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  const setValue = useCallback((value: number) => setCount(value), []);

  return {
    count,
    increment,
    decrement,
    reset,
    setValue,
  };
}
