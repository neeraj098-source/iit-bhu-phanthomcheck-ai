import { motion } from "motion/react";
import { Shield, Eye, Scan, Cpu, Database, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ActionButton } from "../components/ActionButton";
import { useApp } from "../context/AppContext";
import { translations } from "../utils/translations";

const messages = [
  { key: "analyzing", icon: Eye },
  { key: "checkingFont", icon: Scan },
  { key: "runningELA", icon: Cpu },
  { key: "verifyingAmount", icon: Database },
  { key: "crossChecking", icon: Database },
  { key: "finalizing", icon: CheckCircle2 },
];

export function Scanning() {
  const navigate = useNavigate();
  const { language } = useApp();
  const t = translations[language];
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [activeAnnotations, setActiveAnnotations] = useState<number[]>([]);

  useEffect(() => {
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            // Randomly show fake or genuine result
            const isFake = Math.random() > 0.5;
            navigate(isFake ? "/result-fake" : "/result-genuine");
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Message rotation
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 800);

    // Annotation animations
    const annotationInterval = setInterval(() => {
      setActiveAnnotations((prev) => {
        const next = [...prev, Math.floor(Math.random() * 4)];
        if (next.length > 3) next.shift();
        return next;
      });
    }, 1200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearInterval(annotationInterval);
    };
  }, [navigate]);

  const currentMessage = messages[messageIndex];
  const CurrentIcon = currentMessage.icon;

  return (
    <div className="min-h-screen bg-[#0A0E1A] dark:bg-[#0A0E1A] light:bg-[#F5F7FA] flex flex-col items-center justify-center px-6 relative overflow-hidden transition-colors duration-300">
      {/* Matrix-style background */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100 }}
            animate={{ y: "100vh" }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2,
            }}
            className="absolute text-[#00F5A0] text-xs font-mono"
            style={{ left: `${Math.random() * 100}%` }}
          >
            {Array.from({ length: 10 })
              .map(() => Math.floor(Math.random() * 2))
              .join("")}
          </motion.div>
        ))}
      </div>

      {/* Scan area with annotations */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        {/* Micro-interaction annotations */}
        <div className="relative w-full aspect-square max-w-[300px] mb-8">
          {/* Corner brackets */}
          {[
            { top: 0, left: 0, rotate: 0 },
            { top: 0, right: 0, rotate: 90 },
            { bottom: 0, right: 0, rotate: 180 },
            { bottom: 0, left: 0, rotate: 270 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute w-12 h-12"
              style={pos}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            >
              <svg width="48" height="48" viewBox="0 0 48 48">
                <path
                  d="M 0 12 L 0 0 L 12 0"
                  stroke="#00F5A0"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
          ))}

          {/* Scanning grid lines */}
          {activeAnnotations.includes(0) && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              className="absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00F5A0] to-transparent"
            />
          )}
          {activeAnnotations.includes(1) && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-gradient-to-b from-transparent via-[#00F5A0] to-transparent"
            />
          )}
          {activeAnnotations.includes(2) && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              className="absolute top-3/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00F5A0] to-transparent"
            />
          )}
          {activeAnnotations.includes(3) && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-gradient-to-b from-transparent via-[#00F5A0] to-transparent"
            />
          )}

          {/* Animated shield with scan ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 -m-12"
              >
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="#00F5A0"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="20 10"
                    opacity="0.5"
                  />
                </svg>
              </motion.div>

              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative p-8 flex items-center justify-center"
              >
                <Shield
                  className="w-32 h-32 text-[#00F5A0]"
                  strokeWidth={1.5}
                  fill="#00F5A020"
                />
              </motion.div>

              {/* Pulsing scan line */}
              <motion.div
                animate={{ y: [-60, 60] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-[#00F5A0] to-transparent blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Progress percentage */}
        <motion.div
          key={progress}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-6xl font-bold text-[#00F5A0] mb-4"
          style={{ fontFamily: "JetBrains Mono, monospace" }}
        >
          {progress}%
        </motion.div>

        {/* Progress bar */}
        <div className="w-full max-w-xs h-2 bg-[#1E2D40] rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#00F5A0] to-[#00C48C]"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Status message with icon */}
        <motion.div
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-[#8B9AB0] dark:text-[#8B9AB0] light:text-[#64748B] text-center mb-12 h-6 flex items-center gap-2"
        >
          <CurrentIcon className="w-4 h-4 text-[#00F5A0]" />
          {t[currentMessage.key as keyof typeof t] as string}
        </motion.div>

        {/* Micro-interaction annotations - floating labels */}
        <div className="absolute top-20 left-8 md:left-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: activeAnnotations.includes(0) ? 1 : 0, x: 0 }}
            className="bg-[#00F5A0]/10 border border-[#00F5A0]/30 rounded-lg px-3 py-2 backdrop-blur-sm"
          >
            <p className="text-xs text-[#00F5A0] font-mono">
              {language === "en" ? "Pixel Analysis" : "पिक्सेल विश्लेषण"}
            </p>
          </motion.div>
        </div>

        <div className="absolute top-40 right-8 md:right-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: activeAnnotations.includes(1) ? 1 : 0, x: 0 }}
            className="bg-[#00F5A0]/10 border border-[#00F5A0]/30 rounded-lg px-3 py-2 backdrop-blur-sm"
          >
            <p className="text-xs text-[#00F5A0] font-mono">
              {language === "en" ? "Font Match" : "फ़ॉन्ट मिलान"}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-48 left-8 md:left-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: activeAnnotations.includes(2) ? 1 : 0, x: 0 }}
            className="bg-[#00F5A0]/10 border border-[#00F5A0]/30 rounded-lg px-3 py-2 backdrop-blur-sm"
          >
            <p className="text-xs text-[#00F5A0] font-mono">
              {language === "en" ? "Metadata Check" : "मेटाडेटा जांच"}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-48 right-8 md:right-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: activeAnnotations.includes(3) ? 1 : 0, x: 0 }}
            className="bg-[#00F5A0]/10 border border-[#00F5A0]/30 rounded-lg px-3 py-2 backdrop-blur-sm"
          >
            <p className="text-xs text-[#00F5A0] font-mono">
              {language === "en" ? "AI Detection" : "AI पहचान"}
            </p>
          </motion.div>
        </div>

        {/* Cancel button */}
        <div className="w-full max-w-xs mt-8">
          <ActionButton variant="ghost" onClick={() => navigate("/fakepay")}>
            {t.cancel}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}