"use client";

type Color = "blue" | "green" | "red" | "yellow" | "purple" | "cyan";

const colorMap: Record<Color, { bg: string; text: string; icon: string }> = {
  blue:   { bg: "bg-blue-500/10", text: "text-blue-400", icon: "text-blue-500" },
  green:  { bg: "bg-green-500/10", text: "text-green-400", icon: "text-green-500" },
  red:    { bg: "bg-red-500/10", text: "text-red-400", icon: "text-red-500" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-400", icon: "text-yellow-500" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", icon: "text-purple-500" },
  cyan:   { bg: "bg-cyan-500/10", text: "text-cyan-400", icon: "text-cyan-500" },
};

export default function StatCard({
  icon,
  value,
  label,
  trend,
  color = "blue",
}: {
  icon: string;
  value: string | number;
  label: string;
  trend?: string;
  color?: Color;
}) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border border-slate-700 bg-slate-900 p-5`}>
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.bg}`}>
          <span className={`text-lg ${c.icon}`}>{icon}</span>
        </div>
        {trend && <span className="text-xs font-semibold text-slate-400">{trend}</span>}
      </div>
      <p className={`mt-3 text-2xl font-black ${c.text}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}
