import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface FraudScoreGaugeProps {
  score: number;
  isFake: boolean;
  label: string;
  subtitle: string;
}

export function FraudScoreGauge({ score, isFake, label, subtitle }: FraudScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const color = isFake ? "#FF3B3B" : "#00C48C";
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 1;
        setDisplayScore(current);
        if (current >= score) {
          clearInterval(interval);
        }
      }, 15);
    }, 300);

    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center py-8">
      <div className="relative">
        <svg width="200" height="200" className="transform -rotate-90">
          <circle
            cx="100"
            cy="100"
            r="80"
            stroke="#1E2D40"
            strokeWidth="12"
            fill="none"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 10px ${color}40)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-5xl font-bold"
            style={{ color, fontFamily: "JetBrains Mono, monospace" }}
          >
            {displayScore}%
          </motion.div>
        </div>
      </div>
      <div className="text-center mt-4">
        <div className="text-white text-lg font-semibold mb-1">{label}</div>
        <div className="text-[#8B9AB0] text-sm">{subtitle}</div>
      </div>
    </div>
  );
}
