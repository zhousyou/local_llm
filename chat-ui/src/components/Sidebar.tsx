import { Plus, MessageSquare, Cpu, Bug } from "lucide-react";
import { useChatStore } from "@/store/chatStore";
import { NavLink } from "react-router-dom";

export function Sidebar() {
  const sessions = useChatStore((state) => state.sessions);
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const createSession = useChatStore((state) => state.createSession);
  const setActiveSession = useChatStore((state) => state.setActiveSession);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-surface/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-cyan to-blue-600 text-white shadow-lg shadow-brand-cyan/20">
          <Cpu size={18} />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold leading-none text-slate-100">
            Local LLM
          </h1>
          <p className="mt-0.5 text-[10px] text-slate-500">qwen3.5-4b</p>
        </div>
      </div>

      <div className="px-4 pb-3">
        <button
          type="button"
          onClick={createSession}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-abyss-950/50 py-2.5 text-sm font-medium text-slate-200 transition-all hover:border-brand-amber/40 hover:bg-brand-amber/10 hover:text-brand-amber"
        >
          <Plus size={16} />
          新建对话
        </button>
      </div>

      <div className="px-3 py-2">
        <nav className="space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-amber/10 text-brand-amber"
                  : "text-slate-400 hover:bg-surface-hover hover:text-slate-200"
              }`
            }
          >
            <MessageSquare size={16} />
            对话
          </NavLink>
          <NavLink
            to="/debug"
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-amber/10 text-brand-amber"
                  : "text-slate-400 hover:bg-surface-hover hover:text-slate-200"
              }`
            }
          >
            <Bug size={16} />
            终端调试
          </NavLink>
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <h2 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          最近会话
        </h2>
        <div className="space-y-1">
          {sessions.map((session, index) => (
            <button
              key={session.id}
              type="button"
              onClick={() => setActiveSession(session.id)}
              className={`group flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
                activeSessionId === session.id || (!activeSessionId && index === 0)
                  ? "bg-brand-amber/10 text-brand-amber"
                  : "text-slate-400 hover:bg-surface-hover hover:text-slate-200"
              }`}
            >
              <MessageSquare
                size={15}
                className={`mt-0.5 shrink-0 ${
                  activeSessionId === session.id || (!activeSessionId && index === 0)
                    ? "text-brand-amber"
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{session.title}</p>
                <p className="mt-0.5 truncate text-[10px] opacity-70">
                  {new Date(session.createdAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 p-4 text-[10px] text-slate-500">
        模型在本地运行，对话数据不会离开你的设备。
      </div>
    </aside>
  );
}
