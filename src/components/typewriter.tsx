import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Types / deletes through a list of phrases forever.
 * Renders inside a fixed-height block so the layout never shifts.
 */
export function Typewriter({
  phrases,
  className,
  typeSpeed = 70,
  deleteSpeed = 38,
  holdMs = 1000,
}: {
  phrases: string[];
  className?: string;
  typeSpeed?: number;
  deleteSpeed?: number;
  holdMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[index % phrases.length] ?? "";

    if (!deleting && text === current) {
      const id = window.setTimeout(() => setDeleting(true), holdMs);
      return () => window.clearTimeout(id);
    }

    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % phrases.length);
      return;
    }

    const id = window.setTimeout(
      () =>
        setText((t) => (deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1))),
      deleting ? deleteSpeed : typeSpeed,
    );
    return () => window.clearTimeout(id);
  }, [text, deleting, index, phrases, typeSpeed, deleteSpeed, holdMs]);

  const longest = phrases.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    <span className={cn("relative inline-block align-top", className)}>
      {/* Invisible sizer keeps the line height and width stable. */}
      <span aria-hidden="true" className="invisible block whitespace-nowrap">
        {longest}
      </span>
      <span className="absolute inset-0 block" aria-live="polite">
        {text}
        <span
          aria-hidden="true"
          className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-[0.08em] rounded-full bg-primary/80 align-middle motion-safe:animate-caret-blink"
        />
      </span>
    </span>
  );
}
