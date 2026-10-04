import { Home, History, Flag, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";
import { translations } from "../utils/translations";

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useApp();
  const t = translations[language];

  const items = [
    { icon: Home, label: t.home, path: "/home" },
    { icon: History, label: t.history, path: "/history" },
    { icon: Flag, label: language === "en" ? "Report" : "रिपोर्ट", path: "/report" },
    { icon: Settings, label: t.settings, path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#111827]/95 dark:bg-[#111827]/95 light:bg-white/95 border-t border-[#1E2D40] dark:border-[#1E2D40] light:border-[#E2E8F0] backdrop-blur-lg transition-colors duration-300">
      <div className="max-w-md md:max-w-3xl lg:max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 px-4 py-2 transition-colors"
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive 
                      ? "text-[#00F5A0] dark:text-[#00F5A0] light:text-[#00C48C]" 
                      : "text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B]"
                  }`}
                  strokeWidth={1.5}
                />
                <span className={`text-xs ${
                  isActive 
                    ? "text-[#00F5A0] dark:text-[#00F5A0] light:text-[#00C48C]" 
                    : "text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B]"
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}