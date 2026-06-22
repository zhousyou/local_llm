import { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/MessageBubble";
import { ChatInput } from "@/components/ChatInput";
import { EmptyState } from "@/components/EmptyState";
import { ThinkingToggle } from "@/components/ThinkingToggle";
import { useChat } from "@/hooks/useChat";
import { useChatStore } from "@/store/chatStore";

export function ChatPage() {
  const { session, isStreaming, thinkingEnabled, sendMessage, stopGeneration } = useChat();
  const toggleThinking = useChatStore((state) => state.toggleThinking);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages, isStreaming]);

  const lastAssistantId =
    [...session.messages].reverse().find((m) => m.role === "assistant")?.id || null;

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-slate-800 bg-abyss-950/80 px-6 py-3 backdrop-blur-md">
        <h2 className="font-display text-sm font-semibold text-slate-200">
          {session.title}
        </h2>
        <div className="flex items-center gap-4">
          <ThinkingToggle
            enabled={thinkingEnabled}
            onToggle={toggleThinking}
            disabled={isStreaming}
          />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-xs text-slate-400">本地模型已就绪</span>
          </div>
        </div>
      </header>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6 md:px-8"
      >
        <div className="mx-auto max-w-3xl">
          {session.messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-5">
              {session.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  thinkingEnabled={thinkingEnabled}
                  isStreaming={
                    isStreaming &&
                    message.role === "assistant" &&
                    message.id === lastAssistantId
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-800 bg-abyss-950/90 px-4 pb-5 pt-3 backdrop-blur-md md:px-8">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            onSend={sendMessage}
            onStop={stopGeneration}
            isStreaming={isStreaming}
          />
          <p className="mt-2 text-center text-[10px] text-slate-600">
            模型可能生成不准确的内容，请核验重要信息。
          </p>
        </div>
      </div>
    </main>
  );
}
