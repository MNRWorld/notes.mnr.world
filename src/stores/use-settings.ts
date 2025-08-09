
"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Settings {
  font: string;
  passcode: string;
  name: string;
  isFirstVisit: boolean;
}

interface SettingsState extends Settings {
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setFirstVisit: (value: boolean) => void;
}

const defaultSettings: Settings = {
  font: "font-hind-siliguri",
  passcode: "",
  name: "Ghosty",
  isFirstVisit: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setSetting: (key, value) => set({ [key]: value }),
      setFirstVisit: (value: boolean) => set({ isFirstVisit: value }),
    }),
    {
      name: "mnrnotes-settings-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return (state, error) => {
          if (error) {
            console.error("Failed to rehydrate settings", error);
          }
          if (state) {
             if (typeof state.isFirstVisit !== 'boolean') {
               state.isFirstVisit = true;
             }
          }
        }
      },
      partialize: (state) => ({
        font: state.font,
        passcode: state.passcode,
        name: state.name,
        isFirstVisit: state.isFirstVisit,
      }),
    },
  ),
);
