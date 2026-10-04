import { motion } from "motion/react";
import { Shield, Check, Type, Clock, Image, Hash, DollarSign } from "lucide-react";
import { useNavigate } from "react-router";
import { FraudScoreGauge } from "../components/FraudScoreGauge";
import { ActionButton } from "../components/ActionButton";
import { useApp } from "../context/AppContext";
import { translations } from "../utils/translations";

export function ResultGenuine() {
  const navigate = useNavigate();
  const { language } = useApp();
  const t = translations[language];

  const verifiedChecks = [
    { icon: Type, key: "uiDetail" },
    { icon: Clock, key: "metadataCleanDetail" },
    { icon: Image, key: "pixelCleanDetail" },
    { icon: Hash, text: language === "en" ? "Transaction ID format valid" : "लेन-देन ID प्रारूप मान्य" },
    { icon: DollarSign, text: language === "en" ? "Amount field unmodified" : "राशि फ़ील्ड अपरिवर्तित" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001A0E] via-[#0A0E1A] to-[#0A0E1A] dark:from-[#001A0E] dark:via-[#0A0E1A] dark:to-[#0A0E1A] light:from-[#D1FAE5] light:via-[#F5F7FA] light:to-[#F5F7FA] transition-colors duration-300">
      {/* Top Section - Safe State */}
      <div className="px-6 pt-12 pb-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-flex mb-6"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 30px rgba(0,196,140,0.4)",
                "0 0 50px rgba(0,196,140,0.6)",
                "0 0 30px rgba(0,196,140,0.4)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-6 bg-[#00C48C]/10 rounded-full"
          >
            <div className="relative">
              <Shield className="w-20 h-20 text-[#00C48C]" strokeWidth={1.5} />
              <Check className="w-10 h-10 text-[#00C48C] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
            </div>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-[#00C48C] mb-2"
        >
          ✓ {t.verifiedGenuine}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white dark:text-white light:text-[#0A0E1A] text-lg"
        >
          {t.safeToAccept}
        </motion.p>
      </div>

      {/* Fraud Score */}
      <div className="px-6 mb-8">
        <FraudScoreGauge
          score={97}
          isFake={false}
          label={t.confidenceScore}
          subtitle={t.lowRisk}
        />
      </div>

      {/* Verified Checks */}
      <div className="px-6 pb-8">
        <h3 className="text-white dark:text-white light:text-[#0A0E1A] text-xl font-semibold mb-4">
          {language === "en" ? "Verified Checks" : "सत्यापित जांच"}
        </h3>
        <div className="space-y-3">
          {verifiedChecks.map((check, index) => (
            <VerifiedCheckItem
              key={index}
              icon={check.icon}
              text={check.key ? (t[check.key as keyof typeof t] as string) : check.text!}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-8 space-y-3">
        <ActionButton variant="success" onClick={() => navigate("/home")}>
          {language === "en" ? "Safe to Accept" : "स्वीकार करने के लिए सुरक्षित"}
        </ActionButton>
        <ActionButton variant="ghost" onClick={() => navigate("/fakepay")}>
          {t.scanAnother}
        </ActionButton>
      </div>
    </div>
  );
}

function VerifiedCheckItem({
  icon: Icon,
  text,
  index,
}: {
  icon: any;
  text: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-3 p-4 bg-[#111827] dark:bg-[#111827] light:bg-white border border-[#1E2D40] dark:border-[#1E2D40] light:border-[#E2E8F0] rounded-xl transition-colors duration-300"
    >
      <div className="p-2 bg-[#00C48C]/10 rounded-lg">
        <Icon className="w-5 h-5 text-[#00C48C]" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <p className="text-white dark:text-white light:text-[#0A0E1A] text-sm">{text}</p>
      </div>
      <Check className="w-5 h-5 text-[#00C48C]" strokeWidth={2} />
    </motion.div>
  );
}