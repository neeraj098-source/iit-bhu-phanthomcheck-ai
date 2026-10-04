import { Receipt, Mic, Link2, Shield, Bell, Settings, Globe, Moon, Sun, Smartphone, Monitor } from "lucide-react";
import { useNavigate } from "react-router";
import { FeatureCard } from "../components/FeatureCard";
import { StatPill } from "../components/StatPill";
import { BottomNavigation } from "../components/BottomNavigation";
import { useApp } from "../context/AppContext";
import { translations } from "../utils/translations";

export function Home() {
  const navigate = useNavigate();
  const { language, setLanguage, theme, setTheme, isMobileView, setIsMobileView } = useApp();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[#0A0E1A] dark:bg-[#0A0E1A] light:bg-[#F5F7FA] pb-24 transition-colors duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2D40] dark:border-[#1E2D40] light:border-[#E2E8F0] transition-colors duration-300">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#00F5A0]/10 rounded-lg">
            <Shield className="w-5 h-5 text-[#00F5A0]" strokeWidth={1.5} />
          </div>
          <span className="text-white dark:text-white light:text-[#0A0E1A] font-semibold">{t.phantomCheck}</span>
        </div>
        <div className="flex items-center gap-3">
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

          <button className="p-2 hover:bg-[#1E2D40]/30 dark:hover:bg-[#1E2D40]/30 light:hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B]" strokeWidth={1.5} />
          </button>
          <button
            className="p-2 hover:bg-[#1E2D40]/30 dark:hover:bg-[#1E2D40]/30 light:hover:bg-[#F1F5F9] rounded-lg transition-colors"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-5 h-5 text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B]" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="px-6 py-8">
        <h1 className="text-white dark:text-white light:text-[#0A0E1A] text-3xl md:text-4xl font-bold mb-2">
          {t.whatCheck}
        </h1>
        <p className="text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B]">{t.resultsIn}</p>
      </div>

      {/* Feature Cards */}
      <div className={`px-6 mb-8 ${isMobileView ? 'flex flex-col space-y-4' : 'space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:space-y-0'}`}>
        <FeatureCard
          icon={Receipt}
          title={t.fakePayDetector}
          subtitle={t.uploadUPI}
          badge={t.mostUsed}
          onClick={() => navigate("/fakepay")}
        />
        <FeatureCard
          icon={Mic}
          title={t.voiceScamShield}
          subtitle={t.detectAI}
          onClick={() => navigate("/voicescam")}
        />
        <FeatureCard
          icon={Link2}
          title={t.linkGuard}
          subtitle={t.checkLink}
          onClick={() => navigate("/linkguard")}
        />
      </div>

      {/* Stats Bar */}
      <div className="mx-6 bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E2D40] dark:border-[#1E2D40] light:border-[#E2E8F0] rounded-2xl p-5 transition-colors duration-300">
        <div className="grid grid-cols-3 divide-x divide-[#1E2D40] dark:divide-[#1E2D40] light:divide-[#E2E8F0]">
          <StatPill value="2.3K" label={t.scamsCaught} />
          <StatPill value="₹84L" label={t.savedWeek} />
          <StatPill value="3 sec" label={t.avgScan} />
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}