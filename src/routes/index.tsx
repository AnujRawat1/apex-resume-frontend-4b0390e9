import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Compass,
  FileSearch,
  LayoutDashboard,
  MessageSquareText,
  PenLine,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import { LandingNav } from "@/components/landing-nav";
import { SiteFooter } from "@/components/site-footer";
import { Typewriter } from "@/components/typewriter";
import { useAuth } from "@/lib/auth-provider";

const HERO_PHRASES = [
  "Career Journey.",
  "Resume.",
  "Interview.",
  "Dream Job.",
  "Job Application.",
  "Career Growth.",
  "Offer Journey.",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ApexHire — Get interview-ready with AI" },
      {
        name: "description",
        content:
          "Analyze your resume, rehearse AI interviews, get career mentoring and generate cover letters in one premium workspace.",
      },
      { property: "og:title", content: "ApexHire — Get interview-ready with AI" },
      {
        property: "og:description",
        content: "Analyze resumes, rehearse AI interviews and generate cover letters.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    title: "Resume Analyzer",
    description: "ATS-aware scoring across structure, keywords and measurable impact.",
    icon: FileSearch,
  },
  {
    title: "AI Interview",
    description: "Role-specific mock interviews with instant, structured feedback.",
    icon: MessageSquareText,
  },
  {
    title: "AI Career Mentor",
    description: "Personalised roadmaps that close the gap to your target role.",
    icon: Compass,
  },
  {
    title: "Cover Letter Generator",
    description: "Tailored, recruiter-ready cover letters for every application.",
    icon: PenLine,
  },
];

const STEPS = [
  {
    title: "Upload your resume",
    description: "Drop in a PDF and paste the job description you're targeting.",
    icon: Upload,
  },
  {
    title: "Get your score",
    description: "See exactly which keywords, metrics and sections are holding you back.",
    icon: Target,
  },
  {
    title: "Rehearse and apply",
    description: "Practise the interview, generate the cover letter, then hit send.",
    icon: Sparkles,
  },
];

const STATS = [
  { value: "6x", label: "Faster tailoring per application" },
  { value: "40+", label: "Signals checked on every resume" },
  { value: "24/7", label: "AI mentor and interviewer" },
];

const TESTIMONIALS = [
  {
    quote:
      "I finally understood why my resume was getting filtered out. Two rewrites later I had three interviews.",
    name: "Priya S.",
    role: "Frontend Engineer",
  },
  {
    quote:
      "The mock interviews are brutally honest in the best way. Walked into the real one already warmed up.",
    name: "Daniel K.",
    role: "Data Analyst",
  },
  {
    quote:
      "Cover letters used to take me an hour each. Now it's a minute and they actually sound like me.",
    name: "Meera R.",
    role: "Product Designer",
  },
];

const FAQS = [
  {
    q: "Is ApexHire free to start?",
    a: "Yes. Create an account and run your first resume analysis and mock interview at no cost.",
  },
  {
    q: "Does it work for any role?",
    a: "Paste any job description and ApexHire adapts its scoring, questions and cover letter to that role.",
  },
  {
    q: "What happens to my resume?",
    a: "Your documents stay tied to your account and are only used to generate your own feedback.",
  },
];

function Landing() {
  const { user, ready } = useAuth();
  const signedIn = ready && !!user;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="aurora left-[-12%] top-[-12%] size-[460px] bg-primary animate-float" />
      <div className="aurora right-[-10%] top-[18%] size-[400px] bg-primary-glow animate-float" />

      <LandingNav />

      <main className="relative mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <section className="grid animate-fade-up items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-semibold leading-[1.08] sm:text-6xl">
              <span className="block">Ace Every Step Of Your</span>
              <Typewriter
                phrases={HERO_PHRASES}
                className="mt-1 block text-primary"
              />
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
              ApexHire scores your resume against real job descriptions, rehearses the interview
              with you and writes the cover letter — all in one calm, focused workspace.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3 lg:justify-start">
              {signedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    className="group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:translate-y-0"
                  >
                    Go to dashboard
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/resume-analyzer"
                    className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-6 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0"
                  >
                    Analyze my resume
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated active:translate-y-0"
                  >
                    Create free account
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex h-12 items-center rounded-xl border border-border bg-card px-6 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft active:translate-y-0"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="relative">
            <div className="hero-radial left-1/2 top-1/2 size-[120%] -translate-x-1/2 -translate-y-1/2 opacity-70" />
            <img
              src="/Landing.png"
              alt="ApexHire dashboard showing ATS score, resume match and interview score"
              width={1536}
              height={1024}
              className="relative mx-auto w-full max-w-2xl object-contain motion-safe:animate-float-soft"
            />
          </div>
        </section>

        <section id="product" className="grid gap-4 scroll-mt-24 pb-6 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="surface-card hover-lift p-6 text-center">
              <p className="font-display text-4xl font-semibold text-gradient">{stat.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </section>

        <section id="features" className="scroll-mt-24 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Everything you need to get hired</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
              Four connected modules that take you from a rough draft to an offer conversation.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="surface-card hover-lift group p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-secondary text-primary transition-colors duration-300 group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 py-10">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">How it works</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="surface-card hover-lift relative p-6">
                <span className="absolute right-5 top-5 font-display text-4xl font-semibold text-secondary">
                  {i + 1}
                </span>
                <span className="grid size-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                  <step.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Loved by job seekers</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="surface-card hover-lift p-6">
                <blockquote className="text-sm leading-relaxed text-muted-foreground">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                    {t.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="resources" className="scroll-mt-24 pb-16">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Frequently asked</h2>
          <div className="mx-auto mt-8 max-w-2xl space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="surface-card group p-5">
                <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden">
                  {faq.q}
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="pricing" className="surface-card mb-20 scroll-mt-24 overflow-hidden p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            Ready to make your next application count?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Set up your workspace in under a minute and run your first analysis today.
          </p>
          <div className="mt-7 flex justify-center">
            <Link
              to={signedIn ? "/dashboard" : "/signup"}
              className="group inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated"
            >
              {signedIn ? "Open my workspace" : "Get started free"}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
