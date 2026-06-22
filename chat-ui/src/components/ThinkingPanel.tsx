import { useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

interface ThinkingPanelProps {
  thinking: string;
  isStreaming?: boolean;
}

export function ThinkingPanel({ thinking, isStreaming }: ThinkingPanelProps) {
  const [expanded, setExpanded] = useState(false);

  if (!thinking && !isStreaming) return null;

  return (
    <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between px-3 py-2 text-left transition-colors hover:bg-amber-500/10"
      >
        <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
          <Lightbulb size={14} />
          <span>思考过程</span>
          {isStreaming && (
            <span className="ml-1 inline-flex gap-0.5">
              <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse-dot" style={{ animationDelay: "0ms" }} />
              <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse-dot" style={{ animationDelay: "200ms" }} />
              <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse-dot" style={{ animationDelay: "400ms" }} />
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={14} className="text-slate-400" />
        ) : (
          <ChevronDown size={14} className="text-slate-400" />
        )}
      </button>
      <div
        className="transition-all duration-300 ease-out"
        style={{
          maxHeight: expanded ? "400px" : "0px",
          opacity: expanded ? 1 : 0,
        }}
      >
        <div className="max-h-96 overflow-y-auto px-3 pb-3 pt-1">
          <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-amber-100/80">
            {thinking || "正在思考..."}
          </p>
        </div>
      </div>
    </div>
  );
}
