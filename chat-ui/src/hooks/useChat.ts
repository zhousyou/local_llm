import { useCallback, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import type { Message, OllamaStreamChunk } from "@/types/chat";

const generateId = () => Math.random().toString(36).slice(2, 11);

export function useChat() {
  const abortRef = useRef<AbortController | null>(null);

  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const sessions = useChatStore((state) => state.sessions);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const thinkingEnabled = useChatStore((state) => state.thinkingEnabled);
  const addMessage = useChatStore((state) => state.addMessage);
  const appendToMessage = useChatStore((state) => state.appendToMessage);
  const setIsStreaming = useChatStore((state) => state.setIsStreaming);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const sessionId = activeSession.id;
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };
      addMessage(sessionId, userMessage);

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        thinking: "",
        timestamp: Date.now(),
      };
      addMessage(sessionId, assistantMessage);

      setIsStreaming(true);
      abortRef.current = new AbortController();

      try {
        const history = activeSession.messages
          .filter((m) => m.id !== assistantMessage.id)
          .map((m) => ({ role: m.role, content: m.content }));

        const messages: { role: string; content: string }[] = [];
        if (thinkingEnabled) {
          messages.push({
            role: "system",
            content:
              "请在回复前先进行逐步思考，并将思考过程放在 <think>...</think> 标签中。最终答案放在思考过程之后。",
          });
        } else {
          messages.push({
            role: "system",
            content: "请直接给出最终回答，不要输出思考过程。",
          });
        }
        messages.push(...history, { role: "user", content: content.trim() });

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "qwen3.5-4b",
            messages,
            stream: true,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            try {
              const data: OllamaStreamChunk = JSON.parse(line);
              const patch: { content?: string; thinking?: string } = {};
              if (data.message.content) {
                patch.content = data.message.content;
              }
              if (data.message.thinking && thinkingEnabled) {
                patch.thinking = data.message.thinking;
              }
              if (patch.content !== undefined || patch.thinking !== undefined) {
                appendToMessage(sessionId, assistantMessage.id, patch);
              }
            } catch {
              // Ignore malformed JSON lines
            }
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        appendToMessage(sessionId, assistantMessage.id, {
          content: "\n\n请求失败，请确认本地 Ollama 服务已启动（`ollama serve`）且模型已加载。",
        });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [
      activeSession,
      addMessage,
      appendToMessage,
      isStreaming,
      setIsStreaming,
      thinkingEnabled,
    ]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    session: activeSession,
    isStreaming,
    thinkingEnabled,
    sendMessage,
    stopGeneration,
  };
}
