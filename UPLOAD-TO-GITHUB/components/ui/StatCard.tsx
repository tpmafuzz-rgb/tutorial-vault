import * as React from "react";

export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="group card p-5 transition-shadow duration-300 hover:shadow-card">
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface text-muted transition-colors group-hover:text-ink">
          {icon}
        </span>
      </div>
      <div className="mt-3 text-[30px] font-semibold tracking-tighter text-ink tabular-nums">
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[12.5px] text-muted">{hint}</div>}
    </div>
  );
}
