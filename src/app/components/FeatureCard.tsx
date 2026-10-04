import { LucideIcon, ChevronRight } from "lucide-react";
import { useApp } from "../context/AppContext";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge?: string;
  onClick?: () => void;
}

export function FeatureCard({ icon: Icon, title, subtitle, badge, onClick }: FeatureCardProps) {
  const { isMobileView } = useApp();

  return (
    <button
      onClick={onClick}
      className={`w-full bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E2D40] dark:border-[#1E2D40] light:border-[#E2E8F0] rounded-2xl ${isMobileView ? 'p-3' : 'p-5'} hover:border-[#00F5A0]/50 dark:hover:border-[#00F5A0]/50 light:hover:border-[#00C48C]/50 transition-all group`}
      style={{
        boxShadow: "0 4px 24px rgba(0,245,160,0.08)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className={`flex items-center ${isMobileView ? 'gap-2' : 'gap-4'}`}>
        <div className={`${isMobileView ? 'p-2' : 'p-3'} bg-[#00F5A0]/10 dark:bg-[#00F5A0]/10 light:bg-[#00C48C]/10 rounded-xl group-hover:bg-[#00F5A0]/20 dark:group-hover:bg-[#00F5A0]/20 light:group-hover:bg-[#00C48C]/20 transition-colors`}>
          <Icon className={`${isMobileView ? 'w-5 h-5' : 'w-6 h-6'} text-[#00F5A0] dark:text-[#00F5A0] light:text-[#00C48C]`} strokeWidth={1.5} />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-white dark:text-white light:text-[#0A0E1A] font-semibold ${isMobileView ? 'text-sm' : 'text-base'}`}>{title}</h3>
            {badge && (
              <span className={`px-2 py-0.5 bg-[#00F5A0]/20 dark:bg-[#00F5A0]/20 light:bg-[#00C48C]/20 text-[#00F5A0] dark:text-[#00F5A0] light:text-[#00C48C] rounded-md uppercase tracking-wide ${isMobileView ? 'text-[10px]' : 'text-xs'}`}>
                {badge}
              </span>
            )}
          </div>
          <p className={`text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] ${isMobileView ? 'text-xs leading-snug' : 'text-sm'}`}>{subtitle}</p>
        </div>
        {!isMobileView && (
          <ChevronRight className="w-5 h-5 text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] group-hover:text-[#00F5A0] dark:group-hover:text-[#00F5A0] light:group-hover:text-[#00C48C] transition-colors" />
        )}
      </div>
    </button>
  );
}