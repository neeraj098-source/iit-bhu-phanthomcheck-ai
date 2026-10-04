import { Shield, Upload, Mic, AlertTriangle, Search } from "lucide-react";
import { useState } from "react";
import { TopAppBar } from "../components/TopAppBar";
import { ActionButton } from "../components/ActionButton";
import { AudioWaveform } from "../components/AudioWaveform";
import { BottomNavigation } from "../components/BottomNavigation";

export function VoiceScamShield() {
  const [activeTab, setActiveTab] = useState<"upload" | "record">("upload");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const handleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      // Auto-stop after 10 seconds for demo
      setTimeout(() => {
        setIsRecording(false);
        clearInterval(interval);
      }, 10000);
    } else {
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-24">
      <TopAppBar title="VoiceScam Shield" icon={Shield} />

      {/* Warning Banner */}
      <div className="mx-6 mt-6 p-4 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-[#FFB800] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
        <p className="text-[#FFB800] text-sm">
          AI voice cloning scams are rising 340% in India
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-8">
        <div className="flex gap-2 p-1 bg-[#111827] border border-[#1E2D40] rounded-xl">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${
              activeTab === "upload"
                ? "bg-[#00F5A0]/10 text-[#00F5A0]"
                : "text-[#8B9AB0]"
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setActiveTab("record")}
            className={`flex-1 py-2 px-4 rounded-lg transition-all ${
              activeTab === "record"
                ? "bg-[#00F5A0]/10 text-[#00F5A0]"
                : "text-[#8B9AB0]"
            }`}
          >
            Record Now
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-8">
        {activeTab === "upload" ? (
          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-8 text-center">
            <div className="inline-flex p-4 bg-[#00F5A0]/10 rounded-2xl mb-4">
              <Upload className="w-12 h-12 text-[#00F5A0]" strokeWidth={1.5} />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">
              Upload Audio File
            </h3>
            <p className="text-[#8B9AB0] text-sm mb-6">
              Supports MP3, WAV, M4A formats
            </p>
            <ActionButton variant="secondary">
              Choose File
            </ActionButton>
          </div>
        ) : (
          <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-8 text-center">
            <AudioWaveform isRecording={isRecording} />
            
            <div className="my-6">
              <div
                className="text-4xl font-bold text-[#00F5A0] mb-2"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {formatTime(recordingTime)}
              </div>
              <p className="text-[#8B9AB0] text-sm">
                Play the suspicious call near your phone
              </p>
            </div>

            <button
              onClick={handleRecord}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? "bg-[#FF3B3B] shadow-[0_0_30px_rgba(255,59,59,0.5)]"
                  : "bg-[#FF3B3B]/20 hover:bg-[#FF3B3B]/30"
              }`}
            >
              <Mic className="w-8 h-8 text-white" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {/* What We Detect */}
      <div className="px-6 mt-8">
        <h3 className="text-white text-lg font-semibold mb-4">What We Detect</h3>
        <div className="space-y-3">
          <DetectionItem
            icon={Search}
            text="AI voice synthesis patterns"
          />
          <DetectionItem
            icon={Search}
            text="Unnatural speech rhythm"
          />
          <DetectionItem
            icon={Search}
            text="Background audio artifacts"
          />
        </div>
      </div>

      <div className="px-6 mt-8">
        <ActionButton variant="primary">
          Analyze Audio
        </ActionButton>
      </div>

      <BottomNavigation />
    </div>
  );
}

function DetectionItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#111827] border border-[#1E2D40] rounded-xl">
      <div className="p-2 bg-[#00F5A0]/10 rounded-lg">
        <Icon className="w-5 h-5 text-[#00F5A0]" strokeWidth={1.5} />
      </div>
      <p className="text-white text-sm">{text}</p>
    </div>
  );
}
