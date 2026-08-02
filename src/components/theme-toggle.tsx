import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 hover:text-foreground hover:shadow-soft active:scale-95",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute size-[18px] transition-all duration-300",
          theme === "dark" ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute size-[18px] transition-all duration-300",
          theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0",
        )}
      />
    </button>
  );
}
