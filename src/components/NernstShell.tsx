import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Atom, BookOpenText, FlaskConical, Info, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { to: "/calculator" as const, label: "Calculator", icon: FlaskConical },
  { to: "/learn" as const, label: "Learn", icon: BookOpenText },
  { to: "/about" as const, label: "About", icon: Info },
];

export function NernstShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("nernstlab-theme");
    const enabled = saved === "dark";
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  function toggleTheme() {
    const enabled = !dark;
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
    window.localStorage.setItem("nernstlab-theme", enabled ? "dark" : "light");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <Link to="/" aria-label="NernstLab home" className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Atom aria-hidden="true" size={20} />
            </span>
            <span className="font-display text-lg font-bold">NernstLab</span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-2">
            {navigation.map(({ to, label, icon: Icon }) => (
              <Button
                key={to}
                asChild
                variant={pathname === to ? "secondary" : "ghost"}
                size="sm"
                className="px-2 sm:px-3"
              >
                <Link to={to}>
                  <Icon aria-hidden="true" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              title={dark ? "Switch to light theme" : "Switch to dark theme"}
              className="ml-1"
            >
              {dark ? <Sun /> : <Moon />}
            </Button>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-border px-5 py-6 text-center text-sm text-muted-foreground">
        NernstLab <span className="mx-2">·</span> Engineering Chemistry – UBA4911
      </footer>
    </div>
  );
}