"use client";

import { useState, useCallback, useTransition } from "react";

export function useLoadingState(
  initialState = false,
): [boolean, <T>(action: () => Promise<T>) => Promise<T | void>] {
  const [isLoading, setIsLoading] = useState(initialState);
  const [isPending, startTransition] = useTransition();

  const handleAction = useCallback(
    <T>(action: () => Promise<T>): Promise<T | void> => {
      return new Promise((resolve, reject) => {
        startTransition(async () => {
          setIsLoading(true);
          try {
            const result = await action();
            resolve(result);
          } catch (error) {
            console.error("Action failed", error);
            reject(error);
          } finally {
            setIsLoading(false);
          }
        });
      });
    },
    [],
  );

  return [isLoading || isPending, handleAction];
}
