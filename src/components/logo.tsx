import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  showName = true,
  to = "/",
}: {
  className?: string;
  showName?: boolean;
  to?: string;
}) {
  return (
    <Link
      to={to}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="ApexHire home"
    >
      <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-3">
        <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
          <path d="M12 3 4 20h4l4-9 4 9h4L12 3Z" fill="currentColor" fillOpacity="0.95" />
        </svg>
      </span>
      {showName && (
        <span className="font-display text-[17px] font-semibold tracking-tight">
          Apex<span className="text-gradient">Hire</span>
        </span>
      )}
    </Link>
  );
}
