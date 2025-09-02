"use client";

import { useState, useCallback, useTransition } from "react";

export function useLoadingState(
  initialState = false,
): [boolean, <T>(action: () => Promise<T>) => Promise<T | void>] {
  const [isLoading, setIsLoading] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const handleAction = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | void> => {
      setIsLoading(true);
      try {
        const result = await action();
        return result;
      } catch (error) {
        console.error("Action failed", error);
        throw error; // Re-throw the error so the caller can handle it
      } finally {
        // Use startTransition to prevent UI blocking during state updates
        startTransition(() => {
          setIsLoading(false);
        });
      }
    },
    [],
  );

  return [isLoading || isPending, handleAction];
}
