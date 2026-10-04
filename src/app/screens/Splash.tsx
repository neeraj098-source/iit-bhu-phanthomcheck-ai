import { motion } from "motion/react";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { ActionButton } from "../components/ActionButton";

export function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Hexagonal grid background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%2300F5A0' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated shield logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1, bounce: 0.5 }}
          className="relative mb-8"
        >
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(0,245,160,0.3)",
                "0 0 40px rgba(0,245,160,0.5)",
                "0 0 20px rgba(0,245,160,0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-8 bg-[#00F5A0]/10 rounded-3xl"
          >
            <Shield className="w-24 h-24 text-[#00F5A0]" strokeWidth={1.5} fill="#00F5A020" />
            {/* Phantom silhouette inside */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-12 h-16 bg-[#0A0E1A] rounded-t-full opacity-50" />
            </motion.div>
          </motion.div>

          {/* Scanning line effect */}
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 h-1 bg-gradient-to-r from-transparent via-[#00F5A0] to-transparent"
            style={{ filter: "blur(2px)" }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold text-white mb-2"
        >
          PhantomCheck AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-[#8B9AB0] text-center mb-12 max-w-xs"
        >
          "Because Every Scam Leaves a Shadow"
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="w-full max-w-xs"
        >
          <ActionButton variant="primary" onClick={() => navigate("/home")}>
            Start Scanning
          </ActionButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-[#8B9AB0] text-sm mt-12"
        >
          Protecting 10,000+ Indians Daily
        </motion.p>
      </div>
    </div>
  );
}
