"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Settings {
  font: string;
  passcode: string;
  name: string;
  hasSeenOnboarding: boolean;
}

interface SettingsState extends Settings {
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setHasSeenOnboarding: (value: boolean) => void;
}

const defaultSettings: Settings = {
  font: "font-hind-siliguri",
  passcode: "",
  name: "ব্যবহারকারী",
  hasSeenOnboarding: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setSetting: (key, value) => set({ [key]: value }),
      setHasSeenOnboarding: (value: boolean) =>
        set({ hasSeenOnboarding: value }),
    }),
    {
      name: "mnrnotes-settings-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
          }
          if (state) {
            if (typeof state.hasSeenOnboarding !== "boolean") {
              state.hasSeenOnboarding = false;
            }
          }
        };
      },
      partialize: (state) => ({
        font: state.font,
        passcode: state.passcode,
        name: state.name,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
    },
  ),
);
