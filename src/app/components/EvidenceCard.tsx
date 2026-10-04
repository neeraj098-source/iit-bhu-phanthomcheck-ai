import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface EvidenceCardProps {
  icon: LucideIcon;
  title: string;
  detail: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  index?: number;
}

export function EvidenceCard({ icon: Icon, title, detail, severity, index = 0 }: EvidenceCardProps) {
  const severityStyles = {
    HIGH: "bg-[#FF3B3B]/10 text-[#FF3B3B] border-[#FF3B3B]/30",
    MEDIUM: "bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30",
    LOW: "bg-[#8B9AB0]/10 text-[#8B9AB0] border-[#8B9AB0]/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-5"
      style={{ boxShadow: "0 4px 24px rgba(0,245,160,0.08)" }}
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-[#00F5A0]/10 rounded-lg">
          <Icon className="w-5 h-5 text-[#00F5A0]" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-white font-medium">{title}</h4>
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${severityStyles[severity]}`}>
              {severity}
            </span>
          </div>
          <p className="text-[#8B9AB0] text-sm">{detail}</p>
        </div>
      </div>
    </motion.div>
  );
}
