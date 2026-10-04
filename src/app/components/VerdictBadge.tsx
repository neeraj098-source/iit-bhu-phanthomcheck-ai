import { motion } from "motion/react";

type VerdictType = "FAKE" | "SAFE" | "SUSPICIOUS" | "ANALYZING";

interface VerdictBadgeProps {
  type: VerdictType;
  className?: string;
}

export function VerdictBadge({ type, className = "" }: VerdictBadgeProps) {
  const styles = {
    FAKE: "bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/30",
    SAFE: "bg-[#00C48C]/10 text-[#00C48C] border-[#00C48C]/30",
    SUSPICIOUS: "bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30",
    ANALYZING: "bg-[#00F5A0]/10 text-[#00F5A0] border-[#00F5A0]/30",
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.5 }}
      className={`inline-flex items-center px-3 py-1 rounded-lg border ${styles[type]} ${className}`}
      style={{ fontFamily: "JetBrains Mono, monospace" }}
    >
      <span className="text-xs font-medium uppercase tracking-wide">{type}</span>
    </motion.div>
  );
}
