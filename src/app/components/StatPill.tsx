interface StatPillProps {
  value: string;
  label: string;
}

export function StatPill({ value, label }: StatPillProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[#00F5A0] dark:text-[#00F5A0] light:text-[#00C48C] font-bold text-lg mb-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>
        {value}
      </div>
      <div className="text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] text-xs text-center leading-tight">
        {label}
      </div>
    </div>
  );
}