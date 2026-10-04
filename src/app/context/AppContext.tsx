import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface AppContextType {
  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  isMobileView: boolean;
  setIsMobileView: (isMobile: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  useEffect(() => {
    // Apply theme class to document
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  return (
    <AppContext.Provider value={{ language, setLanguage, theme, setTheme, isMobileView, setIsMobileView }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
