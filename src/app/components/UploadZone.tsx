import { motion } from "motion/react";
import { CloudUpload } from "lucide-react";
import { useState } from "react";

interface UploadZoneProps {
  onUpload?: (file: File) => void;
  supportedFormats?: string;
}

export function UploadZone({ onUpload, supportedFormats = "JPG, PNG, PDF" }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload?.(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload?.(e.target.files[0]);
    }
  };

  return (
    <div className="relative">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? "#00F5A0" : "#00F5A050",
        }}
        className="relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(0,245,160,0.05) 0%, transparent 100%)",
        }}
      >
        {/* Animated scanning line */}
        <motion.div
          animate={{
            y: ["-100%", "200%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-[#00F5A0]/20 to-transparent"
          style={{ pointerEvents: "none" }}
        />

        <input
          type="file"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          accept="image/*,.pdf"
        />

        <div className="relative z-0">
          <motion.div
            animate={{
              scale: isDragging ? 1.1 : 1,
            }}
            className="inline-flex p-4 bg-[#00F5A0]/10 rounded-2xl mb-4"
          >
            <CloudUpload className="w-12 h-12 text-[#00F5A0]" strokeWidth={1.5} />
          </motion.div>
          <h3 className="text-white text-xl font-semibold mb-2">
            Drop UPI Screenshot Here
          </h3>
          <p className="text-[#8B9AB0] mb-4">
            Supports PhonePe, GPay, Paytm, BHIM
          </p>
          <p className="text-[#8B9AB0] text-sm">
            or tap to upload from gallery
          </p>
        </div>
      </motion.div>
      <p className="text-[#8B9AB0] text-sm text-center mt-3">
        Supported formats: {supportedFormats}
      </p>
    </div>
  );
}
