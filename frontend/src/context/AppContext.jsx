import { createContext, useState, useContext, useEffect } from "react";

const AppContext = createContext();

export function AppProvider({ children }) {
    const [language, setLanguage] = useState("en");
    const [theme, setTheme] = useState("dark");
    const [isMobileView, setIsMobileView] = useState(true);

    // Apply theme to body
    useEffect(() => {
        if (theme === "light") {
            document.body.classList.add("light");
        } else {
            document.body.classList.remove("light");
        }
    }, [theme]);

    const value = {
        language,
        setLanguage,
        theme,
        setTheme,
        isMobileView,
        setIsMobileView,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
