import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-provider";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#resources", label: "Resources" },
];

export function LandingNav() {
  const { user, ready } = useAuth();
  const signedIn = ready && !!user;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
      <div
        className={cn(
          "pointer-events-auto mt-0 w-full transition-[max-width,margin,padding,border-radius,background-color,box-shadow,backdrop-filter,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          scrolled
            ? "mt-3 max-w-5xl rounded-3xl border border-border/70 bg-background/70 px-3 py-1.5 shadow-elevated backdrop-blur-xl sm:px-4"
            : "max-w-[100rem] rounded-none border border-transparent bg-transparent px-4 py-3 sm:px-8 lg:px-12",
        )}
        style={{ boxShadow: scrolled ? undefined : "none" }}
      >
        <div className="flex items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
                <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-primary transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {signedIn ? (
              <Link
                to="/dashboard"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground glow-primary transition-all duration-300 hover:-translate-y-0.5"
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden h-10 items-center rounded-xl border border-border bg-card/60 px-4 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft sm:inline-flex"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="hidden h-10 items-center rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground glow-primary transition-all duration-300 hover:-translate-y-0.5 sm:inline-flex"
                >
                  Get Started Free
                </Link>
              </>
            )}
            <button
              type="button"
              aria-label="Toggle navigation menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-all duration-300 hover:text-foreground active:scale-95 lg:hidden"
            >
              {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-[max-height,opacity] duration-300 ease-out lg:hidden",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <nav className="flex flex-col gap-1 py-3">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            {!signedIn && (
              <div className="mt-1 flex gap-2 sm:hidden">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl border border-border bg-card/60 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-gradient-primary text-sm font-semibold text-primary-foreground"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
