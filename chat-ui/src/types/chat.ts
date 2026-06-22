export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface OllamaStreamChunk {
  model: string;
  created_at: string;
  message: {
    role: "assistant";
    content?: string;
    thinking?: string;
  };
  done: boolean;
}
