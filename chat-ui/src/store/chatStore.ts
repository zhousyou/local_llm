import { create } from "zustand";
import type { Message, Session } from "@/types/chat";

interface ChatState {
  sessions: Session[];
  activeSessionId: string | null;
  isStreaming: boolean;
  thinkingEnabled: boolean;
  createSession: () => void;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  appendToMessage: (
    sessionId: string,
    messageId: string,
    patch: { content?: string; thinking?: string }
  ) => void;
  setIsStreaming: (value: boolean) => void;
  toggleThinking: () => void;
}

const generateId = () => Math.random().toString(36).slice(2, 11);

const createInitialSession = (): Session => {
  const now = Date.now();
  return {
    id: generateId(),
    title: "新对话",
    messages: [],
    createdAt: now,
  };
};

export const useChatStore = create<ChatState>((set) => ({
  sessions: [createInitialSession()],
  activeSessionId: null,
  isStreaming: false,
  thinkingEnabled: true,

  createSession: () =>
    set((state) => {
      const session = createInitialSession();
      return {
        sessions: [session, ...state.sessions],
        activeSessionId: session.id,
      };
    }),

  setActiveSession: (id) => set({ activeSessionId: id }),

  addMessage: (sessionId, message) =>
    set((state) => ({
      sessions: state.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const messages = [...session.messages, message];
        const title =
          session.title === "新对话" && message.role === "user"
            ? message.content.slice(0, 20) || "新对话"
            : session.title;
        return { ...session, messages, title };
      }),
    })),

  appendToMessage: (sessionId, messageId, patch) =>
    set((state) => ({
      sessions: state.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        return {
          ...session,
          messages: session.messages.map((message) => {
            if (message.id !== messageId) return message;
            return {
              ...message,
              content: patch.content !== undefined ? message.content + patch.content : message.content,
              thinking: patch.thinking !== undefined
                ? (message.thinking || "") + patch.thinking
                : message.thinking,
            };
          }),
        };
      }),
    })),

  setIsStreaming: (value) => set({ isStreaming: value }),

  toggleThinking: () =>
    set((state) => ({ thinkingEnabled: !state.thinkingEnabled })),
}));
