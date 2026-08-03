import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, LogOut, Menu, Settings, User, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-provider";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/resume-analyzer", label: "Resume Analyzer" },
  { to: "/ai-interview", label: "AI Interview" },
  { to: "/career-mentor", label: "AI Career Mentor" },
  { to: "/cover-letter", label: "Cover Letter Generator" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const initials = (user?.fullName || user?.username || "A")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    toast.success("Signed out", { description: "See you soon." });
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo to="/" />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:bg-secondary hover:text-foreground",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-primary transition-transform duration-300",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => toast("No new notifications", { description: "You're all caught up." })}
            className="relative hidden size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 hover:text-foreground hover:shadow-soft active:scale-95 sm:inline-flex"
          >
            <Bell className="size-[18px]" />
            <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-gradient-primary" />
          </button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Profile menu"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-1 transition-all duration-300 hover:shadow-soft active:scale-95 sm:pr-3"
              >
                <span className="grid size-8 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {initials}
                </span>
                <span className="hidden max-w-28 truncate text-sm font-medium sm:block">
                  {user?.username ?? "Guest"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel className="flex flex-col">
                <span className="truncate">{user?.fullName ?? "Guest"}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {user?.email ?? "—"}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                <User className="size-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                <Settings className="size-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="size-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-all duration-300 hover:text-foreground active:scale-95 lg:hidden"
          >
            {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-border/70 transition-[max-height,opacity] duration-300 ease-out lg:hidden",
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 hover:bg-secondary",
                pathname === link.to ? "bg-secondary text-foreground" : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-secondary"
          >
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
