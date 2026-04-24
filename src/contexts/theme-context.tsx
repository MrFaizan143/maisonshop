import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

export type ThemeKey = "default" | "fashion" | "grocery" | "electronics" | "home" | "beauty";

const ThemeCtx = createContext<{ theme: ThemeKey }>({ theme: "default" });

const VALID: ThemeKey[] = ["fashion", "grocery", "electronics", "home", "beauty"];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [theme, setTheme] = useState<ThemeKey>("default");

  useEffect(() => {
    const m = path.match(/^\/category\/([^/]+)/);
    const slug = m?.[1] as ThemeKey | undefined;
    setTheme(slug && VALID.includes(slug) ? slug : "default");
  }, [path]);

  const value = useMemo(() => ({ theme }), [theme]);

  return (
    <ThemeCtx.Provider value={value}>
      <div data-theme={theme === "default" ? undefined : theme} className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
