import { Filter, Upload, Mic, Link2, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { BottomNavigation } from "../components/BottomNavigation";

type FilterType = "all" | "fake" | "safe" | "links" | "voice";

export function ScanHistory() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const navigate = useNavigate();

  const scans = [
    {
      id: 1,
      type: "fakepay",
      name: "GPay_Screenshot.jpg",
      verdict: "safe",
      date: "2 hours ago",
    },
    {
      id: 2,
      type: "fakepay",
      name: "PhonePe_Payment.png",
      verdict: "fake",
      date: "5 hours ago",
    },
    {
      id: 3,
      type: "link",
      name: "bit.ly/payment-urgent-123",
      verdict: "fake",
      date: "1 day ago",
    },
    {
      id: 4,
      type: "voice",
      name: "suspicious_call.mp3",
      verdict: "fake",
      date: "2 days ago",
    },
    {
      id: 5,
      type: "fakepay",
      name: "Paytm_Receipt.jpg",
      verdict: "safe",
      date: "3 days ago",
    },
  ];

  const filteredScans = scans.filter((scan) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "fake") return scan.verdict === "fake";
    if (activeFilter === "safe") return scan.verdict === "safe";
    if (activeFilter === "links") return scan.type === "link";
    if (activeFilter === "voice") return scan.type === "voice";
    return true;
  });

  const stats = {
    total: scans.length,
    fake: scans.filter((s) => s.verdict === "fake").length,
    safe: scans.filter((s) => s.verdict === "safe").length,
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "fakepay":
        return Upload;
      case "voice":
        return Mic;
      case "link":
        return Link2;
      default:
        return Shield;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2D40]">
        <h1 className="text-white text-2xl font-bold">Scan History</h1>
        <button className="p-2 hover:bg-[#1E2D40]/30 rounded-lg transition-colors">
          <Filter className="w-5 h-5 text-[#8B9AB0]" strokeWidth={1.5} />
        </button>
      </div>

      {/* Stats Card */}
      <div className="mx-6 mt-6 bg-[#111827] border border-[#1E2D40] rounded-2xl p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-[#00F5A0] text-2xl font-bold mb-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              {stats.total}
            </div>
            <div className="text-[#8B9AB0] text-xs">Total Scans</div>
          </div>
          <div>
            <div className="text-[#FF3B3B] text-2xl font-bold mb-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              {stats.fake}
            </div>
            <div className="text-[#8B9AB0] text-xs">Scams Blocked</div>
          </div>
          <div>
            <div className="text-[#00F5A0] text-2xl font-bold mb-1" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              ₹23.4K
            </div>
            <div className="text-[#8B9AB0] text-xs">Money Protected</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 mt-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterButton
            label="All"
            active={activeFilter === "all"}
            onClick={() => setActiveFilter("all")}
          />
          <FilterButton
            label="Fake"
            active={activeFilter === "fake"}
            onClick={() => setActiveFilter("fake")}
          />
          <FilterButton
            label="Safe"
            active={activeFilter === "safe"}
            onClick={() => setActiveFilter("safe")}
          />
          <FilterButton
            label="Links"
            active={activeFilter === "links"}
            onClick={() => setActiveFilter("links")}
          />
          <FilterButton
            label="Voice"
            active={activeFilter === "voice"}
            onClick={() => setActiveFilter("voice")}
          />
        </div>
      </div>

      {/* Scan List */}
      <div className="px-6 mt-6 space-y-3">
        {filteredScans.length > 0 ? (
          filteredScans.map((scan) => {
            const Icon = getIcon(scan.type);
            return (
              <button
                key={scan.id}
                onClick={() =>
                  navigate(scan.verdict === "fake" ? "/result-fake" : "/result-genuine")
                }
                className="w-full flex items-center gap-3 p-4 bg-[#111827] border border-[#1E2D40] rounded-xl hover:border-[#00F5A0]/30 transition-colors"
              >
                <div className="w-12 h-12 bg-[#1E2D40] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#8B9AB0]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-white text-sm font-medium mb-1 truncate">
                    {scan.name}
                  </div>
                  <div className="text-[#8B9AB0] text-xs">{scan.date}</div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                    scan.verdict === "fake"
                      ? "bg-[#FF3B3B]/10 text-[#FF3B3B]"
                      : "bg-[#00C48C]/10 text-[#00C48C]"
                  }`}
                >
                  {scan.verdict === "fake" ? "FAKE" : "SAFE"}
                </div>
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-6 bg-[#111827] rounded-full mb-4">
              <Shield className="w-16 h-16 text-[#8B9AB0] opacity-30" strokeWidth={1.5} />
            </div>
            <p className="text-[#8B9AB0]">No scans in this category</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
        active
          ? "bg-[#00F5A0]/10 text-[#00F5A0] border border-[#00F5A0]/30"
          : "bg-[#111827] text-[#8B9AB0] border border-[#1E2D40]"
      }`}
    >
      {label}
    </button>
  );
}
