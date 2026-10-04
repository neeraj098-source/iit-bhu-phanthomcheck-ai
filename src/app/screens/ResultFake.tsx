import { motion } from "motion/react";
import { Shield, X, Type, Clock, Image, Flag, Share2, AlertTriangle, XOctagon } from "lucide-react";
import { useNavigate } from "react-router";
import { FraudScoreGauge } from "../components/FraudScoreGauge";
import { EvidenceCard } from "../components/EvidenceCard";
import { ActionButton } from "../components/ActionButton";
import { useApp } from "../context/AppContext";
import { translations } from "../utils/translations";
import { useEffect, useState } from "react";

export function ResultFake() {
  const navigate = useNavigate();
  const { language, theme } = useApp();
  const t = translations[language];
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // Trigger shake animation
    const shakeInterval = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }, 3000);

    return () => clearInterval(shakeInterval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2D0A0A] via-[#1A0000] to-[#0A0E1A] dark:from-[#2D0A0A] dark:via-[#1A0000] dark:to-[#0A0E1A] light:from-[#FEE2E2] light:via-[#FEF2F2] light:to-[#F5F7FA] transition-colors duration-300 relative overflow-hidden">
      {/* Animated danger stripes background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <motion.div
          animate={{ x: [0, 100] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, #FF3B3B 0px, #FF3B3B 20px, transparent 20px, transparent 40px)",
          }}
        />
      </div>

      {/* Pulsing red vignette */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, transparent 40%, rgba(255, 59, 59, 0.3) 100%)",
        }}
      />

      {/* Top Section - Danger State */}
      <div className="px-6 pt-12 pb-6 text-center relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
          className="inline-flex mb-6"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 40px rgba(255,59,59,0.6), 0 0 80px rgba(255,59,59,0.4)",
                "0 0 60px rgba(255,59,59,0.8), 0 0 120px rgba(255,59,59,0.6)",
                "0 0 40px rgba(255,59,59,0.6), 0 0 80px rgba(255,59,59,0.4)",
              ],
              scale: shake ? [1, 1.1, 0.9, 1.1, 1] : 1,
            }}
            transition={{ 
              boxShadow: { duration: 2, repeat: Infinity },
              scale: { duration: 0.5 }
            }}
            className="p-6 bg-[#FF3B3B]/20 dark:bg-[#FF3B3B]/20 light:bg-[#FF3B3B]/10 rounded-full border-4 border-[#FF3B3B]"
          >
            <div className="relative">
              <XOctagon className="w-24 h-24 text-[#FF3B3B]" strokeWidth={2.5} fill="rgba(255, 59, 59, 0.2)" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <X className="w-12 h-12 text-[#FF3B3B]" strokeWidth={4} />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
          }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <motion.h1
            animate={{ 
              scale: shake ? [1, 1.05, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            className="text-4xl font-bold text-[#FF3B3B] mb-2 flex items-center justify-center gap-3"
          >
            <AlertTriangle className="w-8 h-8" strokeWidth={2.5} />
            {t.fakeDetected}
          </motion.h1>
          
          {/* DANGER Alert Banner */}
          <motion.div
            animate={{
              backgroundColor: ["rgba(255, 59, 59, 0.2)", "rgba(255, 59, 59, 0.4)", "rgba(255, 59, 59, 0.2)"],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-block px-6 py-3 rounded-full border-2 border-[#FF3B3B]"
          >
            <p className="text-[#FF3B3B] text-sm font-bold uppercase tracking-wider">
              🚨 {language === "en" ? "DANGER - FRAUDULENT PAYMENT" : "खतरा - धोखाधड़ी भुगतान"} 🚨
            </p>
          </motion.div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white dark:text-white light:text-[#0A0E1A] text-xl font-bold mt-4 bg-[#FF3B3B]/20 dark:bg-[#FF3B3B]/20 light:bg-[#FF3B3B]/10 px-6 py-3 rounded-lg inline-block"
        >
          ⛔ {t.doNotAccept}
        </motion.p>
      </div>

      {/* Fraud Score */}
      <div className="px-6 mb-8 relative z-10">
        <FraudScoreGauge
          score={94}
          isFake={true}
          label={t.fraudScore}
          subtitle={t.extremelyHigh}
        />
      </div>

      {/* Evidence Cards */}
      <div className="px-6 pb-8 space-y-4 relative z-10">
        <h3 className="text-white dark:text-white light:text-[#0A0E1A] text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#FF3B3B]" />
          {t.evidenceFound}
        </h3>
        <EvidenceCard
          icon={Type}
          title={t.fontInconsistency}
          detail={t.fontDetail}
          severity="HIGH"
          index={0}
        />
        <EvidenceCard
          icon={Clock}
          title={t.metadataTampering}
          detail={t.metadataDetail}
          severity="HIGH"
          index={1}
        />
        <EvidenceCard
          icon={Image}
          title={t.pixelManipulation}
          detail={t.pixelDetail}
          severity="MEDIUM"
          index={2}
        />
      </div>

      {/* Action Buttons */}
      <div className="px-6 pb-8 space-y-3 relative z-10">
        <ActionButton variant="danger" icon={Flag} onClick={() => alert(language === "en" ? "Reporting to Cyber Cell..." : "साइबर सेल को रिपोर्ट कर रहे हैं...")}>
          {t.reportCyber}
        </ActionButton>
        <ActionButton variant="secondary" icon={Share2}>
          {t.shareWarning}
        </ActionButton>
        <ActionButton variant="ghost" onClick={() => navigate("/fakepay")}>
          {t.scanAnother}
        </ActionButton>

        <p className="text-[#8B9AB0] text-xs text-center pt-4" style={{ fontFamily: "JetBrains Mono, monospace" }}>
          {t.reportID}: PC-2026-03-12-7842
        </p>
      </div>
    </div>
  );
}