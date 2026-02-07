import { create } from "zustand";

type Sender = "user" | "jessica";
type ContextMode = "personal" | "business" | "creative";

export interface ChatMessage {
  id: string;
  sender: Sender;
  content: string;
  createdAt: string;
}

interface ChatStore {
  messages: ChatMessage[];
  input: string;
  isSending: boolean;
  error: string | null;
  contextMode: ContextMode;
  setInput: (value: string) => void;
  setContextMode: (mode: ContextMode) => void;
  clearError: () => void;
  sendMessage: () => void;
}

const initialMessages: ChatMessage[] = [
  {
    id: "1",
    sender: "jessica",
    content:
      "Hey brother, I'm Jessica. I'm connected to Zo Computer now - I remember our context and can help you one step at a time.",
    createdAt: new Date().toISOString(),
  },
];

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: initialMessages,
  input: "",
  isSending: false,
  error: null,
  contextMode: "personal",

  setInput: (value: string) => set({ input: value }),

  setContextMode: (mode: ContextMode) => set({ contextMode: mode }),

  clearError: () => set({ error: null }),

  sendMessage: async () => {
    const { input, messages, contextMode } = get();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      sender: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    set({
      messages: [...messages, userMessage],
      input: "",
      isSending: true,
      error: null,
    });

    try {
      const history = messages
        .filter((m) => m.id !== "1")
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          context: contextMode,
          history,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();

      const jessicaReply: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "jessica",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        messages: [...state.messages, jessicaReply],
        isSending: false,
      }));
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      
      set((state) => ({
        error: errorMessage,
        isSending: false,
      }));

      // Also add an error message to the chat for visibility
      const errorReply: ChatMessage = {
        id: String(Date.now() + 1),
        sender: "jessica",
        content: `Sorry brother, I ran into an issue: ${errorMessage}. Check your connection and try again.`,
        createdAt: new Date().toISOString(),
      };
      
      set((state) => ({
        messages: [...state.messages, errorReply],
      }));
    }
  },
}));
