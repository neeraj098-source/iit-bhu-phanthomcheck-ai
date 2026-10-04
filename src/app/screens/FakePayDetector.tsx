import { Shield, Upload, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import { TopAppBar } from "../components/TopAppBar";
import { UploadZone } from "../components/UploadZone";
import { ActionButton } from "../components/ActionButton";
import { BottomNavigation } from "../components/BottomNavigation";
import { useApp } from "../context/AppContext";
import { translations } from "../utils/translations";

export function FakePayDetector() {
  const navigate = useNavigate();
  const { language } = useApp();
  const t = translations[language];

  const handleUpload = (file: File) => {
    console.log("File uploaded:", file);
    navigate("/scanning");
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] dark:bg-[#0A0E1A] light:bg-[#F5F7FA] pb-24 transition-colors duration-300">
      <TopAppBar title={t.fakePayDetector} icon={Shield} showControls />

      <div className="px-6 py-8">
        <UploadZone onUpload={handleUpload} />

        {/* How It Works */}
        <div className="mt-12">
          <h3 className="text-white dark:text-white light:text-[#0A0E1A] text-lg font-semibold mb-6">
            {language === "en" ? "How It Works" : "यह कैसे काम करता है"}
          </h3>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#00F5A0]/10 dark:bg-[#00F5A0]/10 light:bg-[#00C48C]/10 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-[#00F5A0] dark:text-[#00F5A0] light:text-[#00C48C]" strokeWidth={1.5} />
              </div>
              <span className="text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] text-sm">
                {language === "en" ? "Upload" : "अपलोड"}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] flex-shrink-0" />
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#00F5A0]/10 dark:bg-[#00F5A0]/10 light:bg-[#00C48C]/10 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-[#00F5A0] dark:text-[#00F5A0] light:text-[#00C48C]" strokeWidth={1.5} />
              </div>
              <span className="text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] text-sm">
                {language === "en" ? "AI Scans" : "AI स्कैन"}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] flex-shrink-0" />
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#00F5A0]/10 dark:bg-[#00F5A0]/10 light:bg-[#00C48C]/10 rounded-full flex items-center justify-center mb-3">
                <div className="w-4 h-4 bg-[#00F5A0] dark:bg-[#00F5A0] light:bg-[#00C48C] rounded-full" />
              </div>
              <span className="text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] text-sm">
                {language === "en" ? "Verdict" : "फैसला"}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="mt-12">
          <h3 className="text-white dark:text-white light:text-[#0A0E1A] text-lg font-semibold mb-4">{t.recentScans}</h3>
          <div className="space-y-3">
            <RecentScanItem
              name="GPay_Screenshot.jpg"
              isFake={false}
              time={language === "en" ? "2 hours ago" : "2 घंटे पहले"}
              onClick={() => navigate("/result-genuine")}
            />
            <RecentScanItem
              name="PhonePe_Payment.png"
              isFake={true}
              time={language === "en" ? "5 hours ago" : "5 घंटे पहले"}
              onClick={() => navigate("/result-fake")}
            />
            <RecentScanItem
              name="Paytm_Receipt.jpg"
              isFake={false}
              time={language === "en" ? "1 day ago" : "1 दिन पहले"}
              onClick={() => navigate("/result-genuine")}
            />
          </div>
        </div>

        <div className="mt-8">
          <ActionButton variant="primary" onClick={() => navigate("/scanning")}>
            {language === "en" ? "Scan Screenshot" : "स्क्रीनशॉट स्कैन करें"}
          </ActionButton>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

function RecentScanItem({
  name,
  isFake,
  time,
  onClick,
}: {
  name: string;
  isFake: boolean;
  time: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E2D40] dark:border-[#1E2D40] light:border-[#E2E8F0] rounded-xl hover:border-[#00F5A0]/30 dark:hover:border-[#00F5A0]/30 light:hover:border-[#00C48C]/30 transition-colors"
    >
      <div className="w-12 h-12 bg-[#1E2D40] dark:bg-[#1E2D40] light:bg-[#F1F5F9] rounded-lg flex items-center justify-center flex-shrink-0">
        <Upload className="w-5 h-5 text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B]" />
      </div>
      <div className="flex-1 text-left">
        <div className="text-white dark:text-white light:text-[#0A0E1A] text-sm font-medium mb-1">{name}</div>
        <div className="text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] text-xs">{time}</div>
      </div>
      <div
        className={`px-2 py-1 rounded text-xs font-medium ${
          isFake ? "bg-[#FF3B3B]/10 text-[#FF3B3B]" : "bg-[#00C48C]/10 text-[#00C48C]"
        }`}
      >
        {isFake ? "FAKE" : "SAFE"}
      </div>
    </button>
  );
}