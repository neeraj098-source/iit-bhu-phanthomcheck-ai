import { Shield, Link2, Lock, Calendar, Bug, Repeat, Eye, MapPin, Clipboard } from "lucide-react";
import { useState } from "react";
import { TopAppBar } from "../components/TopAppBar";
import { ActionButton } from "../components/ActionButton";
import { BottomNavigation } from "../components/BottomNavigation";

export function LinkGuard() {
  const [url, setUrl] = useState("");

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-24">
      <TopAppBar title="LinkGuard" icon={Shield} />

      {/* Input Section */}
      <div className="px-6 mt-8">
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste suspicious link here..."
            className="w-full px-4 py-4 pr-12 bg-[#111827] border border-[#1E2D40] rounded-xl text-white placeholder:text-[#8B9AB0] focus:border-[#00F5A0]/50 focus:outline-none transition-colors"
          />
          <button
            onClick={handlePaste}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-[#1E2D40]/30 rounded-lg transition-colors"
          >
            <Clipboard className="w-5 h-5 text-[#8B9AB0]" strokeWidth={1.5} />
          </button>
        </div>
        <p className="text-[#8B9AB0] text-sm mt-3 text-center">
          or share directly from WhatsApp/SMS
        </p>
      </div>

      {/* Quick Examples */}
      <div className="px-6 mt-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setUrl("bit.ly/urgent-payment-123")}
            className="px-3 py-1.5 bg-[#111827] border border-[#1E2D40] rounded-lg text-[#8B9AB0] text-sm hover:border-[#00F5A0]/30 transition-colors"
          >
            bit.ly/...
          </button>
          <button
            onClick={() => setUrl("wa.me/9876543210")}
            className="px-3 py-1.5 bg-[#111827] border border-[#1E2D40] rounded-lg text-[#8B9AB0] text-sm hover:border-[#00F5A0]/30 transition-colors"
          >
            wa.me/...
          </button>
          <button
            onClick={() => setUrl("tinyurl.com/offer-claim")}
            className="px-3 py-1.5 bg-[#111827] border border-[#1E2D40] rounded-lg text-[#8B9AB0] text-sm hover:border-[#00F5A0]/30 transition-colors"
          >
            tinyurl...
          </button>
        </div>
      </div>

      {/* What We Check */}
      <div className="px-6 mt-8">
        <h3 className="text-white text-lg font-semibold mb-4">What We Check</h3>
        <div className="grid grid-cols-2 gap-3">
          <CheckItem icon={Lock} text="SSL Certificate" />
          <CheckItem icon={Calendar} text="Domain Age" />
          <CheckItem icon={Bug} text="Malware Database" />
          <CheckItem icon={Repeat} text="Redirect Chains" />
          <CheckItem icon={Eye} text="Lookalike Detection" />
          <CheckItem icon={MapPin} text="Server Location" />
        </div>
      </div>

      {/* Recent Checks */}
      <div className="px-6 mt-8">
        <h3 className="text-white text-lg font-semibold mb-4">Recent Link Checks</h3>
        <div className="space-y-3">
          <RecentLinkItem
            url="bit.ly/payment-urgent-123"
            isSafe={false}
            time="2 hours ago"
          />
          <RecentLinkItem
            url="google.com/search?q=..."
            isSafe={true}
            time="5 hours ago"
          />
          <RecentLinkItem
            url="wa.me/9876543210"
            isSafe={true}
            time="1 day ago"
          />
        </div>
      </div>

      <div className="px-6 mt-8">
        <ActionButton
          variant="primary"
          disabled={!url}
          onClick={() => alert("Checking link: " + url)}
        >
          Check This Link
        </ActionButton>
      </div>

      <BottomNavigation />
    </div>
  );
}

function CheckItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#111827] border border-[#1E2D40] rounded-xl">
      <div className="p-2 bg-[#00F5A0]/10 rounded-lg">
        <Icon className="w-4 h-4 text-[#00F5A0]" strokeWidth={1.5} />
      </div>
      <p className="text-white text-sm">{text}</p>
    </div>
  );
}

function RecentLinkItem({
  url,
  isSafe,
  time,
}: {
  url: string;
  isSafe: boolean;
  time: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#111827] border border-[#1E2D40] rounded-xl">
      <div className="p-2 bg-[#1E2D40] rounded-lg">
        <Link2 className="w-4 h-4 text-[#8B9AB0]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate mb-1">{url}</div>
        <div className="text-[#8B9AB0] text-xs">{time}</div>
      </div>
      <div
        className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
          isSafe ? "bg-[#00C48C]/10 text-[#00C48C]" : "bg-[#FF3B3B]/10 text-[#FF3B3B]"
        }`}
      >
        {isSafe ? "SAFE" : "DANGER"}
      </div>
    </div>
  );
}
