"use client";

const styles: Record<string, string> = {
  PASS: "bg-green-500/20 text-green-400 border-green-500/30",
  DEFECT: "bg-red-500/20 text-red-400 border-red-500/30",
  NORMAL: "bg-green-500/20 text-green-400 border-green-500/30",
  WARNING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Approved: "bg-green-500/20 text-green-400 border-green-500/30",
  Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
  "Order Now": "bg-red-500/20 text-red-400 border-red-500/30",
  Adequate: "bg-green-500/20 text-green-400 border-green-500/30",
  Monitor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Preferred: "bg-green-500/20 text-green-400 border-green-500/30",
  Backup: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  HIGH: "bg-red-500/20 text-red-400 border-red-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  LOW: "bg-green-500/20 text-green-400 border-green-500/30",
  normal: "bg-green-500/20 text-green-400 border-green-500/30",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  preferred: "bg-green-500/20 text-green-400 border-green-500/30",
  approved: "bg-green-500/20 text-green-400 border-green-500/30",
  under_review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  probation: "bg-red-500/20 text-red-400 border-red-500/30",
  Sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Expired: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  "Order Confirmed": "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function StatusBadge({ status }: { status: string }) {
  const s = styles[status] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
  return (
    <span className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${s}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
