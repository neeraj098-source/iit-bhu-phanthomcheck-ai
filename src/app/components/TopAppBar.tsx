import { ArrowLeft, LucideIcon, Globe, Moon, Sun, Smartphone, Monitor } from "lucide-react";
import { useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

interface TopAppBarProps {
  title: string;
  icon?: LucideIcon;
  onBack?: () => void;
  showControls?: boolean;
}

export function TopAppBar({ title, icon: Icon, onBack, showControls = false }: TopAppBarProps) {
  const navigate = useNavigate();
  const { language, setLanguage, theme, setTheme, isMobileView, setIsMobileView } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-[#0A0E1A] dark:bg-[#0A0E1A] light:bg-white border-b border-[#1E2D40] dark:border-[#1E2D40] light:border-[#E2E8F0] transition-colors duration-300">
      <button
        onClick={handleBack}
        className="p-2 -ml-2 hover:bg-[#1E2D40]/30 dark:hover:bg-[#1E2D40]/30 light:hover:bg-[#F1F5F9] rounded-lg transition-colors"
      >
        <ArrowLeft className="w-5 h-5 text-white dark:text-white light:text-[#0A0E1A]" strokeWidth={1.5} />
      </button>
      <h1 className="text-white dark:text-white light:text-[#0A0E1A] text-xl font-semibold flex-1">{title}</h1>

      {showControls && (
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="p-2 hover:bg-[#1E2D40]/30 dark:hover:bg-[#1E2D40]/30 light:hover:bg-[#F1F5F9] rounded-lg transition-colors flex items-center gap-1"
            title={language === "en" ? "Switch to Hindi" : "अंग्रेजी में बदलें"}
          >
            <Globe className="w-4 h-4 text-[#00F5A0]" strokeWidth={1.5} />
            <span className="text-xs text-white dark:text-white light:text-[#0A0E1A] font-semibold uppercase">{language}</span>
          </button>

          {/* Mobile View Toggle */}
          <button
            onClick={() => setIsMobileView(!isMobileView)}
            className="p-2 hover:bg-[#1E2D40]/30 dark:hover:bg-[#1E2D40]/30 light:hover:bg-[#F1F5F9] rounded-lg transition-colors"
            title={isMobileView ? "Switch to Desktop View" : "Shift to Mobile View"}
          >
            {isMobileView ? (
              <Monitor className="w-5 h-5 text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B]" strokeWidth={1.5} />
            ) : (
              <Smartphone className="w-5 h-5 text-[#00F5A0]" strokeWidth={1.5} />
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 hover:bg-[#1E2D40]/30 dark:hover:bg-[#1E2D40]/30 light:hover:bg-[#F1F5F9] rounded-lg transition-colors"
            title={theme === "dark" ? "Switch to Light Mode" : "डार्क मोड में बदलें"}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-[#FFB800]" strokeWidth={1.5} />
            ) : (
              <Moon className="w-5 h-5 text-[#00F5A0]" strokeWidth={1.5} />
            )}
          </button>
        </div>
      )}

      {Icon && !showControls && (
        <div className="p-2 bg-[#00F5A0]/10 rounded-lg">
          <Icon className="w-5 h-5 text-[#00F5A0]" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}