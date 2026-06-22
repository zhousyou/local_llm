import { Sparkles, Zap, Shield } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-brand-cyan/20 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan to-blue-600 text-white shadow-xl">
          <Sparkles size={28} />
        </div>
      </div>
      <h2 className="font-display text-2xl font-bold text-slate-100">
        本地模型推理可视化
      </h2>
      <p className="mt-3 max-w-md text-sm text-slate-400">
        与本地部署的 qwen3.5-4b 模型对话，流式查看思考过程与正式回复。所有数据均在本地处理，无需联网。
      </p>

      <div className="mt-8 grid max-w-md gap-3 sm:grid-cols-3">
        <FeatureCard icon={<Zap size={18} />} title="实时流式" desc="逐字显示模型输出" />
        <FeatureCard icon={<Sparkles size={18} />} title="思考可视化" desc="折叠查看推理过程" />
        <FeatureCard icon={<Shield size={18} />} title="本地运行" desc="隐私数据不离开设备" />
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700/50 bg-surface/50 p-4 text-center backdrop-blur-sm">
      <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-cyan/10 text-brand-cyan">
        {icon}
      </div>
      <h3 className="text-xs font-semibold text-slate-200">{title}</h3>
      <p className="mt-1 text-[10px] text-slate-500">{desc}</p>
    </div>
  );
}
