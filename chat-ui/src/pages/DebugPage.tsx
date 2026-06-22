import { useEffect, useRef, useState } from "react";
import { Terminal, Trash2, Play, Pause, AlertCircle, CheckCircle2, Info } from "lucide-react";

interface DebugLog {
  id: string;
  type: "stdout" | "stderr" | "info" | "error" | "connected";
  content: string;
  timestamp: number;
}

const EXAMPLE_COMMAND = `./ask_llm_stream.sh 你好 | while IFS= read -r line; do
  curl -s -X POST http://localhost:5173/api/debug/log \\
    -H "Content-Type: application/json" \\
    -d '{"content":"$line"}'
done`;

export function DebugPage() {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const bufferRef = useRef<DebugLog[]>([]);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connect = () => {
      eventSource = new EventSource("/api/debug/stream");

      eventSource.onopen = () => {
        setConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const log: DebugLog = JSON.parse(event.data);
          if (log.type === "connected") return;
          if (paused) {
            bufferRef.current.push(log);
          } else {
            setLogs((prev) => [...prev.slice(-499), log]);
          }
        } catch {
          // Ignore malformed events
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        eventSource?.close();
        setTimeout(connect, 3000);
      };
    };

    fetch("/api/debug/logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      })
      .catch(() => {
        // Ignore initial fetch errors
      })
      .finally(connect);

    return () => {
      eventSource?.close();
    };
  }, [paused]);

  useEffect(() => {
    if (autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  useEffect(() => {
    if (!paused && bufferRef.current.length > 0) {
      setLogs((prev) => [...prev.slice(-499), ...bufferRef.current]);
      bufferRef.current = [];
    }
  }, [paused]);

  const clearLogs = async () => {
    await fetch("/api/debug/logs", { method: "DELETE" });
    setLogs([]);
    bufferRef.current = [];
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  };

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-slate-800 bg-abyss-950/80 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Terminal size={18} className="text-brand-cyan" />
          <h2 className="font-display text-sm font-semibold text-slate-200">
            终端调试
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-red-500"
              }`}
            />
            {connected ? "实时连接中" : "已断开"}
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-surface-hover"
          >
            {paused ? <Play size={13} /> : <Pause size={13} />}
            {paused ? "继续" : "暂停"}
          </button>
          <button
            type="button"
            onClick={clearLogs}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            <Trash2 size={13} />
            清空
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden px-4 py-4 md:px-8">
        <div className="flex h-full flex-col rounded-xl border border-slate-700/50 bg-surface/40 shadow-inner">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 font-mono text-xs"
          >
            {logs.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-500">
                <Terminal size={40} className="mb-3 opacity-30" />
                <p>暂无终端输出</p>
                <p className="mt-1 text-[10px]">
                  在终端运行脚本时将输出推送到调试接口即可在此显示
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {logs.map((log) => (
                  <LogLine key={log.id} log={log} />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-700/50 px-4 py-2 text-[10px] text-slate-500">
            <span>共 {logs.length} 条记录</span>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded border-slate-600 bg-slate-700 text-brand-amber focus:ring-0"
              />
              自动滚动
            </label>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 bg-abyss-950/90 px-4 pb-5 pt-3 backdrop-blur-md md:px-8">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-700/50 bg-surface/60 p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Info size={14} className="text-brand-cyan" />
            使用说明
          </h3>
          <p className="mb-2 text-[11px] leading-relaxed text-slate-400">
            在终端调用脚本时，将输出通过以下命令推送到调试页面：
          </p>
          <pre className="block rounded-lg bg-abyss-950 p-3 font-mono text-[11px] text-slate-300">
            {EXAMPLE_COMMAND}
          </pre>
        </div>
      </div>
    </main>
  );
}

function LogLine({ log }: { log: DebugLog }) {
  const time = new Date(log.timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const typeStyles = {
    stdout: "text-slate-200",
    stderr: "text-red-400",
    info: "text-brand-cyan",
    error: "text-red-400",
    connected: "text-emerald-400",
  };

  const icons = {
    stdout: <CheckCircle2 size={12} className="mt-0.5 text-slate-500" />,
    stderr: <AlertCircle size={12} className="mt-0.5 text-red-500" />,
    info: <Info size={12} className="mt-0.5 text-brand-cyan" />,
    error: <AlertCircle size={12} className="mt-0.5 text-red-500" />,
    connected: <CheckCircle2 size={12} className="mt-0.5 text-emerald-500" />,
  };

  return (
    <div className="flex gap-2.5">
      <span className="shrink-0 text-slate-600">[{time}]</span>
      {icons[log.type] || icons.stdout}
      <pre
        className={`whitespace-pre-wrap break-all ${typeStyles[log.type] || typeStyles.stdout}`}
      >
        {log.content}
      </pre>
    </div>
  );
}
