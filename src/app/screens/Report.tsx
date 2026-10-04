import { BottomNavigation } from "../components/BottomNavigation";
import { Flag, Phone, MessageSquare, Mail, Shield } from "lucide-react";
import { ActionButton } from "../components/ActionButton";

export function Report() {
  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-24">
      <div className="px-6 py-4 border-b border-[#1E2D40]">
        <h1 className="text-white text-2xl font-bold">Report Scam</h1>
        <p className="text-[#8B9AB0] text-sm mt-1">Help us protect others</p>
      </div>

      <div className="px-6 mt-8">
        <div className="bg-[#111827] border border-[#1E2D40] rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-[#00F5A0]/10 rounded-xl">
              <Shield className="w-6 h-6 text-[#00F5A0]" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Why Report?</h3>
              <p className="text-[#8B9AB0] text-sm">
                Your reports help us improve our AI models and protect more people from scams.
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-white text-lg font-semibold mb-4">Report Channels</h3>
        <div className="space-y-3">
          <ReportChannel
            icon={Phone}
            title="Cyber Crime Helpline"
            subtitle="1930 (Toll Free)"
            link="tel:1930"
          />
          <ReportChannel
            icon={MessageSquare}
            title="SMS Report"
            subtitle="Report to 1909"
            link="sms:1909"
          />
          <ReportChannel
            icon={Mail}
            title="Email"
            subtitle="cybercrime@gov.in"
            link="mailto:cybercrime@gov.in"
          />
        </div>

        <div className="mt-8">
          <ActionButton variant="primary" icon={Flag}>
            File Online Complaint
          </ActionButton>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}

function ReportChannel({
  icon: Icon,
  title,
  subtitle,
  link,
}: {
  icon: any;
  title: string;
  subtitle: string;
  link: string;
}) {
  return (
    <a
      href={link}
      className="flex items-center gap-3 p-4 bg-[#111827] border border-[#1E2D40] rounded-xl hover:border-[#00F5A0]/30 transition-colors"
    >
      <div className="p-2 bg-[#00F5A0]/10 rounded-lg">
        <Icon className="w-5 h-5 text-[#00F5A0]" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <div className="text-white font-medium">{title}</div>
        <div className="text-[#8B9AB0] text-sm">{subtitle}</div>
      </div>
    </a>
  );
}
