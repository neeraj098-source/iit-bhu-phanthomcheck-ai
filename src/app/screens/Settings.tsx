import { BottomNavigation } from "../components/BottomNavigation";
import { Bell, Globe, Shield, Info, HelpCircle, LogOut, Moon, Sun } from "lucide-react";
import { useApp } from "../context/AppContext";
import { translations } from "../utils/translations";

export function Settings() {
  const { language, setLanguage, theme, setTheme } = useApp();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#0A0E1A] dark:bg-[#0A0E1A] light:bg-[#F5F7FA] pb-24 transition-colors duration-300">
      <div className="px-6 py-4 border-b border-[#1E2D40] dark:border-[#1E2D40] light:border-[#E2E8F0]">
        <h1 className="text-white dark:text-white light:text-[#0A0E1A] text-2xl font-bold">{t.settings}</h1>
      </div>

      <div className="px-6 mt-6 space-y-6">
        <div>
          <h3 className="text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] text-sm uppercase tracking-wide mb-3">
            {language === "en" ? "Appearance" : "दिखावट"}
          </h3>
          <div className="space-y-2">
            <SettingItem
              icon={theme === "dark" ? Moon : Sun}
              label={language === "en" ? "Theme" : "थीम"}
              value={theme === "dark" ? (language === "en" ? "Dark" : "गहरा") : (language === "en" ? "Light" : "हल्का")}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
            <SettingItem
              icon={Globe}
              label={language === "en" ? "Language" : "भाषा"}
              value={language === "en" ? "English" : "हिंदी"}
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            />
          </div>
        </div>

        <div>
          <h3 className="text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] text-sm uppercase tracking-wide mb-3">
            {language === "en" ? "General" : "सामान्य"}
          </h3>
          <div className="space-y-2">
            <SettingItem
              icon={Bell}
              label={language === "en" ? "Notifications" : "सूचनाएं"}
            />
          </div>
        </div>

        <div>
          <h3 className="text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] text-sm uppercase tracking-wide mb-3">
            {language === "en" ? "Support" : "समर्थन"}
          </h3>
          <div className="space-y-2">
            <SettingItem
              icon={HelpCircle}
              label={language === "en" ? "Help Center" : "सहायता केंद्र"}
            />
            <SettingItem
              icon={Info}
              label={language === "en" ? "About PhantomCheck AI" : "PhantomCheck AI के बारे में"}
            />
            <SettingItem
              icon={Shield}
              label={language === "en" ? "Privacy Policy" : "गोपनीयता नीति"}
            />
          </div>
        </div>

        <div>
          <SettingItem
            icon={LogOut}
            label={language === "en" ? "Sign Out" : "साइन आउट"}
            danger
          />
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

function SettingItem({
  icon: Icon,
  label,
  value,
  danger,
  onClick,
}: {
  icon: any;
  label: string;
  value?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E2D40] dark:border-[#1E2D40] light:border-[#E2E8F0] rounded-xl hover:border-[#00F5A0]/30 dark:hover:border-[#00F5A0]/30 light:hover:border-[#00C48C]/30 transition-colors ${
        danger ? "border-[#FF3B3B]/30" : ""
      }`}
    >
      <Icon
        className={`w-5 h-5 ${danger ? "text-[#FF3B3B]" : "text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B]"}`}
        strokeWidth={1.5}
      />
      <span className={`flex-1 text-left ${danger ? "text-[#FF3B3B]" : "text-white dark:text-white light:text-[#0A0E1A]"}`}>
        {label}
      </span>
      {value && <span className="text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] text-sm">{value}</span>}
    </button>
  );
}