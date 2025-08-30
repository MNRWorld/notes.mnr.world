"use client";

import { create } from "zustand";
import * as localDB from "@/lib/storage";
import type { CustomTemplate, Note } from "@/lib/types";
import { hapticFeedback } from "@/lib/utils";
import { toast } from "sonner";

interface TemplatesState {
  customTemplates: CustomTemplate[];
  fetchCustomTemplates: () => Promise<void>;
  addCustomTemplate: (note: Note) => Promise<void>;
  deleteCustomTemplate: (id: string) => Promise<void>;
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  customTemplates: [],

  fetchCustomTemplates: async () => {
    try {
      const templates = await localDB.getCustomTemplates();
      set({ customTemplates: templates });
    } catch (error) {
      toast.error("কাস্টম টেমপ্লেট লোড করা যায়নি।");
    }
  },

  addCustomTemplate: async (note: Note) => {
    try {
      const newTemplate = await localDB.createTemplateFromNote(note);
      set((state) => ({
        customTemplates: [...state.customTemplates, newTemplate],
      }));
      hapticFeedback("medium");
      toast.success("নোটটি টেমপ্লেট হিসেবে সেভ হয়েছে।");
    } catch (error) {
      toast.error("টেমপ্লেট হিসেবে সেভ করা যায়নি।");
    }
  },

  deleteCustomTemplate: async (id: string) => {
    const originalTemplates = get().customTemplates;
    set((state) => ({
      customTemplates: state.customTemplates.filter(
        (template) => template.id !== id,
      ),
    }));
    try {
      await localDB.deleteCustomTemplate(id);
      hapticFeedback("heavy");
      toast.success("টেমপ্লেট মুছে ফেলা হয়েছে।");
    } catch (error) {
      toast.error("টেমপ্লেট মোছা যায়নি।");
      set({ customTemplates: originalTemplates });
    }
  },
}));
