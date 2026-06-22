import { User, Bot } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ThinkingPanel } from "./ThinkingPanel";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  thinkingEnabled?: boolean;
}

export function MessageBubble({ message, isStreaming, thinkingEnabled = true }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex w-full animate-fade-up ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex max-w-[90%] gap-3 md:max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            isUser
              ? "bg-brand-amber text-abyss-950"
              : "bg-brand-cyan/10 text-brand-cyan"
          }`}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`rounded-2xl px-4 py-3 shadow-md ${
              isUser
                ? "rounded-tr-sm bg-gradient-to-br from-brand-amber to-amber-600 text-abyss-950"
                : "rounded-tl-sm bg-surface border border-slate-700/50"
            }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
                {message.content}
              </p>
            ) : (
              <>
                {thinkingEnabled && (
                  <ThinkingPanel
                    thinking={message.thinking || ""}
                    isStreaming={isStreaming}
                  />
                )}
                <MarkdownRenderer content={message.content} />
                {isStreaming && !message.content && !(thinkingEnabled && message.thinking) && (
                  <div className="flex items-center gap-1.5 py-2 text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse-dot" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse-dot" style={{ animationDelay: "200ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse-dot" style={{ animationDelay: "400ms" }} />
                  </div>
                )}
              </>
            )}
          </div>
          <span className="mt-1.5 text-[10px] text-slate-500">
            {new Date(message.timestamp).toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
