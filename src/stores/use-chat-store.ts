"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import type { ChatMessage } from "@/components/types";

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

interface ChatStore {
  // Current session
  currentSession: ChatSession | null;
  messages: ChatMessage[];

  // All sessions
  sessions: ChatSession[];

  // Actions
  createNewSession: () => void;
  addMessage: (message: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearCurrentChat: () => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  exportChatHistory: () => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// Custom storage for Capacitor
const capacitorStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key: name });
      return value;
    }
    return localStorage.getItem(name);
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

const generateSessionTitle = (firstMessage?: string): string => {
  if (!firstMessage) return "নতুন চ্যাট";

  // Take first 30 characters and add ellipsis if longer
  const title =
    firstMessage.length > 30
      ? firstMessage.substring(0, 30) + "..."
      : firstMessage;

  return title;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      messages: [],
      sessions: [],
      isLoading: false,

      createNewSession: () => {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: "নতুন চ্যাট",
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          currentSession: newSession,
          messages: [],
          sessions: [newSession, ...state.sessions],
        }));
      },

      addMessage: (message: ChatMessage) => {
        const state = get();
        let currentSession = state.currentSession;

        // If no current session, create one
        if (!currentSession) {
          currentSession = {
            id: Date.now().toString(),
            title: "নতুন চ্যাট",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
        }

        const updatedMessages = [...state.messages, message];

        // Update title from first user message
        let title = currentSession.title;
        if (title === "নতুন চ্যাট" && message.type === "user") {
          title = generateSessionTitle(message.query);
        }

        const updatedSession: ChatSession = {
          ...currentSession,
          title,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };

        const updatedSessions = state.sessions.map((session) =>
          session.id === updatedSession.id ? updatedSession : session,
        );

        // If it's a new session, add it to the beginning
        const finalSessions = updatedSessions.find(
          (s) => s.id === updatedSession.id,
        )
          ? updatedSessions
          : [updatedSession, ...state.sessions];

        set({
          currentSession: updatedSession,
          messages: updatedMessages,
          sessions: finalSessions,
        });
      },

      updateLastMessage: (content: string) => {
        const state = get();
        if (state.messages.length === 0) return;

        const updatedMessages = [...state.messages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (lastMessage.type === "bot") {
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            content,
          };
        }

        let currentSession = state.currentSession;
        if (currentSession) {
          const updatedSession: ChatSession = {
            ...currentSession,
            messages: updatedMessages,
            updatedAt: Date.now(),
          };

          const updatedSessions = state.sessions.map((session) =>
            session.id === updatedSession.id ? updatedSession : session,
          );

          set({
            currentSession: updatedSession,
            messages: updatedMessages,
            sessions: updatedSessions,
          });
        }
      },

      loadSession: (sessionId: string) => {
        const state = get();
        const session = state.sessions.find((s) => s.id === sessionId);

        if (session) {
          set({
            currentSession: session,
            messages: session.messages,
          });
        }
      },

      deleteSession: (sessionId: string) => {
        const state = get();
        const updatedSessions = state.sessions.filter(
          (s) => s.id !== sessionId,
        );

        // If deleting current session, clear it
        const newCurrentSession =
          state.currentSession?.id === sessionId ? null : state.currentSession;

        const newMessages =
          state.currentSession?.id === sessionId ? [] : state.messages;

        set({
          sessions: updatedSessions,
          currentSession: newCurrentSession,
          messages: newMessages,
        });
      },

      clearCurrentChat: () => {
        set({
          currentSession: null,
          messages: [],
        });
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        const state = get();
        const updatedSessions = state.sessions.map((session) =>
          session.id === sessionId
            ? { ...session, title, updatedAt: Date.now() }
            : session,
        );

        const updatedCurrentSession =
          state.currentSession?.id === sessionId
            ? { ...state.currentSession, title, updatedAt: Date.now() }
            : state.currentSession;

        set({
          sessions: updatedSessions,
          currentSession: updatedCurrentSession,
        });
      },

      exportChatHistory: () => {
        const state = get();
        const exportData = {
          sessions: state.sessions,
          exportedAt: new Date().toISOString(),
          version: "1.0",
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chat-history-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },

      setIsLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => capacitorStorage),
      // Only persist sessions, not current session state
      partialize: (state) => ({
        sessions: state.sessions,
      }),
    },
  ),
);
