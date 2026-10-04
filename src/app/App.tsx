import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider, useApp } from "./context/AppContext";

function AppLayout() {
  const { isMobileView } = useApp();

  return (
    <div className="min-h-screen bg-[#0A0E1A] dark:bg-[#0A0E1A] light:bg-[#F5F7FA] font-sans transition-colors duration-300" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Mobile and Tablet responsive container */}
      <div className={`${isMobileView ? "max-w-md" : "max-w-md md:max-w-3xl lg:max-w-4xl"} mx-auto bg-[#0A0E1A] dark:bg-[#0A0E1A] light:bg-[#F5F7FA] min-h-screen shadow-2xl transition-all duration-300`}>
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}