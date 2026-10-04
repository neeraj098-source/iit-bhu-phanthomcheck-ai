import { createBrowserRouter } from "react-router";
import { Splash } from "./screens/Splash";
import { Home } from "./screens/Home";
import { FakePayDetector } from "./screens/FakePayDetector";
import { Scanning } from "./screens/Scanning";
import { ResultFake } from "./screens/ResultFake";
import { ResultGenuine } from "./screens/ResultGenuine";
import { VoiceScamShield } from "./screens/VoiceScamShield";
import { LinkGuard } from "./screens/LinkGuard";
import { ScanHistory } from "./screens/ScanHistory";
import { Settings } from "./screens/Settings";
import { Report } from "./screens/Report";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Splash,
  },
  {
    path: "/home",
    Component: Home,
  },
  {
    path: "/fakepay",
    Component: FakePayDetector,
  },
  {
    path: "/scanning",
    Component: Scanning,
  },
  {
    path: "/result-fake",
    Component: ResultFake,
  },
  {
    path: "/result-genuine",
    Component: ResultGenuine,
  },
  {
    path: "/voicescam",
    Component: VoiceScamShield,
  },
  {
    path: "/linkguard",
    Component: LinkGuard,
  },
  {
    path: "/history",
    Component: ScanHistory,
  },
  {
    path: "/settings",
    Component: Settings,
  },
  {
    path: "/report",
    Component: Report,
  },
]);
