import { motion } from "motion/react";

export function AudioWaveform({ isRecording = false }: { isRecording?: boolean }) {
  const bars = Array.from({ length: 40 });

  return (
    <div className="flex items-center justify-center gap-1 h-32">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-[#00F5A0] rounded-full"
          animate={{
            height: isRecording
              ? [
                  Math.random() * 60 + 20,
                  Math.random() * 80 + 30,
                  Math.random() * 60 + 20,
                ]
              : 4,
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  );
}
