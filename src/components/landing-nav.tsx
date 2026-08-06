import { useEffect, useRef, useState } from "react";
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
  { href: "#resources", label: "Resources" },
];

const EASE = "cubic-bezier(0.22,1,0.36,1)";

export function LandingNav() {
  const { user, ready } = useAuth();
  const signedIn = ready && !!user;
  const [scrolled, setScrolled] = useState(false);
  const [liftUp, setLiftUp] = useState(false);
  const [open, setOpen] = useState(false);

  // Refs keep the scroll handler allocation-free and re-render-free.
  const lastY = useRef(0);
  const ticking = useRef(false);
  const scrolledRef = useRef(false);
  const liftRef = useRef(false);

  useEffect(() => {
    const read = () => {
      ticking.current = false;
      const y = window.scrollY;

      // Hysteresis so the state never flickers around the threshold.
      const next = scrolledRef.current ? y > 8 : y > 24;
      if (next !== scrolledRef.current) {
        scrolledRef.current = next;
        setScrolled(next);
      }

      const delta = y - lastY.current;
      if (Math.abs(delta) > 4) {
        const down = delta > 0 && y > 80;
        if (down !== liftRef.current) {
          liftRef.current = down;
          setLiftUp(down);
        }
        lastY.current = y;
      }
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(read);
    };

    lastY.current = window.scrollY;
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center">
      <div
        className={cn(
          "pointer-events-auto relative w-full will-change-transform motion-reduce:!transform-none",
          scrolled
            ? "mt-3 max-w-5xl px-3 py-1.5 sm:px-4"
            : "mt-0 max-w-[100rem] px-4 py-3 sm:px-8 lg:px-12",
        )}
        style={{
          transition: `max-width 380ms ${EASE}, margin-top 380ms ${EASE}, padding 380ms ${EASE}, transform 320ms ${EASE}`,
          transform: `translate3d(0, ${scrolled && liftUp ? "-9px" : "0px"}, 0)`,
        }}
      >
        {/* Isolated background layer: only opacity/blur/shadow animate here. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl border border-border/70 bg-background/70 shadow-elevated backdrop-blur-xl"
          style={{
            transition: `opacity 340ms ${EASE}, border-radius 340ms ${EASE}`,
            opacity: scrolled ? 1 : 0,
            borderRadius: scrolled ? undefined : "0px",
            boxShadow: scrolled
              ? "0 18px 50px -28px color-mix(in oklab, var(--primary) 55%, transparent)"
              : "none",
          }}
        />

        <div className="relative flex items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-[color,transform] duration-200 ease-out hover:-translate-y-px hover:text-foreground motion-reduce:hover:translate-y-0"
              >
                {link.label}
                <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-primary transition-transform duration-300 ease-out group-hover:scale-x-100 motion-reduce:hidden" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {signedIn ? (
              <Link
                to="/dashboard"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground glow-primary transition-transform duration-300 ease-out hover:scale-[1.02] motion-reduce:hover:scale-100"
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden h-10 items-center rounded-xl border border-border bg-card/60 px-4 text-sm font-medium transition-[transform,box-shadow] duration-300 ease-out hover:scale-[1.02] hover:shadow-soft motion-reduce:hover:scale-100 sm:inline-flex"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="hidden h-10 items-center rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground glow-primary transition-transform duration-300 ease-out hover:scale-[1.02] motion-reduce:hover:scale-100 sm:inline-flex"
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
              className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-colors duration-200 hover:text-foreground active:scale-95 lg:hidden"
            >
              {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "relative overflow-hidden lg:hidden",
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
          )}
          style={{ transition: `max-height 300ms ${EASE}, opacity 240ms ease-out` }}
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
