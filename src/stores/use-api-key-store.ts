"use client";

import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

// Custom storage driver that uses Capacitor Preferences on native and localStorage on web
const capacitorStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key: name });
      return value;
    } else {
      return localStorage.getItem(name);
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key: name, value });
    } else {
      localStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key: name });
    } else {
      localStorage.removeItem(name);
    }
  },
};

interface ApiKeyState {
  apiKey: string | null;
  isSkipped: boolean;
  setApiKey: (key: string) => void;
  setSkipped: (skipped: boolean) => void;
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set) => ({
      apiKey: null,
      isSkipped: false,
      setApiKey: (key: string) => set({ apiKey: key, isSkipped: false }),
      setSkipped: (skipped: boolean) => set({ isSkipped: skipped }),
    }),
    {
      name: "mnrnotes-gemini-api-key",
      storage: createJSONStorage(() => capacitorStorage),
    },
  ),
);
