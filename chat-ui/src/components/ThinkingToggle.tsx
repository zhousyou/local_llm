import { Lightbulb, LightbulbOff } from "lucide-react";

interface ThinkingToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function ThinkingToggle({ enabled, onToggle, disabled }: ThinkingToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        enabled
          ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
          : "border-slate-700/60 bg-surface/50 text-slate-400 hover:bg-surface-hover hover:text-slate-200"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      aria-pressed={enabled}
    >
      {enabled ? <Lightbulb size={14} /> : <LightbulbOff size={14} />}
      <span>Thinking {enabled ? "开" : "关"}</span>
      <span
        className={`relative inline-flex h-3.5 w-6 items-center rounded-full transition-colors ${
          enabled ? "bg-amber-500" : "bg-slate-600"
        }`}
      >
        <span
          className={`absolute h-2.5 w-2.5 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-3" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
