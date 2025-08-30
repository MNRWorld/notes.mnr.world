"use client";

import { useState, useCallback } from "react";

type LoadingState = {
  [key: string]: boolean;
};

export function useLoadingState(initialState: LoadingState = {}) {
  const [loading, setLoading] = useState<LoadingState>(initialState);

  const setLoadingFor = useCallback((key: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [key]: isLoading }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loading[key] || false;
  }, [loading]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loading).some(Boolean);
  }, [loading]);

  return {
    loading,
    setLoadingFor,
    isLoading,
    isAnyLoading,
  };
}
