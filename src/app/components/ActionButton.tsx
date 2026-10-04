import { LucideIcon } from "lucide-react";

interface ActionButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function ActionButton({
  children,
  variant = "primary",
  icon: Icon,
  onClick,
  className = "",
}: ActionButtonProps) {
  const variants = {
    primary: "bg-[#00F5A0] text-[#0A0E1A] hover:bg-[#00F5A0]/90 shadow-[0_0_20px_rgba(0,245,160,0.3)]",
    secondary: "bg-[#111827] text-white border border-[#1E2D40] hover:border-[#00F5A0]/50",
    ghost: "bg-transparent text-[#8B9AB0] hover:text-white",
    danger: "bg-[#FF3B3B] text-white hover:bg-[#FF3B3B]/90 shadow-[0_0_20px_rgba(255,59,59,0.3)]",
    success: "bg-[#00C48C] text-white hover:bg-[#00C48C]/90 shadow-[0_0_20px_rgba(0,196,140,0.3)]",
  };

  const heights = {
    primary: "h-14",
    secondary: "h-12",
    ghost: "h-12",
    danger: "h-14",
    success: "h-14",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full ${heights[variant]} px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" strokeWidth={2} />}
      {children}
    </button>
  );
}
