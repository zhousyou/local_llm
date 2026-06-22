import { useState, useRef } from "react";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (isStreaming) {
      onStop();
      return;
    }
    if (!text.trim()) return;
    onSend(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  return (
    <div className="w-full rounded-2xl border border-slate-700/60 bg-surface/90 p-3 shadow-2xl backdrop-blur-md">
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="输入问题，按 Enter 发送，Shift + Enter 换行..."
          rows={1}
          className="max-h-[200px] min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 ${
            isStreaming
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : text.trim()
              ? "bg-brand-amber text-abyss-950 shadow-lg shadow-brand-amber/20 hover:translate-y-[-2px] hover:shadow-brand-amber/30"
              : "cursor-not-allowed bg-slate-700/50 text-slate-500"
          }`}
          aria-label={isStreaming ? "停止生成" : "发送消息"}
        >
          {isStreaming ? <Square size={16} fill="currentColor" /> : <Send size={18} />}
        </button>
      </div>
    </div>
  );
}
