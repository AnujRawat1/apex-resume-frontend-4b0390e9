import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Github, Globe, Linkedin, Mail } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/logo";

type FooterColumn = { heading: string; links: { label: string; to: string }[] };

const COLUMNS: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Resume Analysis", to: "/resume-analyzer" },
      { label: "AI Interviews", to: "/ai-interview" },
      { label: "Career Mentor", to: "/career-mentor" },
      { label: "Job Match", to: "/jd-analyzer" },
      { label: "Cover Letter Generator", to: "/cover-letter" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", to: "#product" },
      { label: "Features", to: "#features" },
      { label: "Pricing", to: "#pricing" },
      { label: "Contact", to: "#pricing" },
      { label: "Privacy Policy", to: "#resources" },
      { label: "Terms of Service", to: "#resources" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Help Center", to: "#resources" },
      { label: "Documentation", to: "#resources" },
      { label: "Blog", to: "#resources" },
      { label: "FAQs", to: "#resources" },
      { label: "Release Notes", to: "#resources" },
    ],
  },
];

const SOCIALS = [
  { label: "GitHub", icon: Github, href: "https://github.com/AnujRawat1" },
  { label: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/anuj-rawat1" },
  { label: "Email", icon: Mail, href: "mailto:anuj.rawat.official1@gmail.com" },
  { label: "Portfolio", icon: Globe, href: "https://portfolio-main-lilac.vercel.app/" },
];

const linkClass =
  "text-sm text-muted-foreground transition-colors duration-200 hover:text-primary";

function FooterLink({ label, to }: { label: string; to: string }) {
  if (to.startsWith("#") || to.startsWith("mailto:")) {
    return (
      <a href={to} className={linkClass}>
        {label}
      </a>
    );
  }
  return (
    <Link to={to} className={linkClass}>
      {label}
    </Link>
  );
}

export function SiteFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="relative border-t border-border/60 bg-background/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI-powered career workspace that helps you optimize your resume, prepare for
              interviews, and land your next opportunity.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="grid size-9 place-items-center rounded-xl border border-border bg-card/60 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary hover:shadow-elevated"
                >
                  <s.icon className="size-[17px]" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.heading} aria-label={col.heading} className="min-w-0">
              <h3 className="text-sm font-semibold">{col.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink {...l} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="glass-panel mt-12 flex flex-col gap-5 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-base font-semibold">Stay Updated</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get product updates and AI career tips directly in your inbox.
            </p>
          </div>
          <form
            className="flex w-full max-w-md gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
                toast.error("Enter a valid email address");
                return;
              }
              setEmail("");
              toast.success("You're subscribed");
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-card/60 px-4 text-sm outline-none transition-all duration-300 placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-ring/40"
            />
            <button
              type="submit"
              className="inline-flex h-11 shrink-0 items-center rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground glow-primary transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} ApexHire. All rights reserved.</p>
          <p>Made with ❤️ for job seekers.</p>
        </div>
      </div>
    </footer>
  );
}
