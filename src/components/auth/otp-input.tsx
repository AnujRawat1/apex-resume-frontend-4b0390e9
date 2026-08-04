import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;
const sanitize = (v: string) => v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const firstEmpty = value.findIndex((d) => !d);
    refs.current[firstEmpty === -1 ? LENGTH - 1 : firstEmpty]?.focus();
    // focus the first empty box on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const commit = (next: string[]) => {
    onChange(next);
    const code = next.join("");
    if (code.length === LENGTH && next.every(Boolean)) onComplete(code);
  };

  const write = (index: number, raw: string) => {
    const chars = sanitize(raw);
    if (!chars) {
      const next = [...value];
      next[index] = "";
      onChange(next);
      return;
    }
    const next = [...value];
    for (let i = 0; i < chars.length && index + i < LENGTH; i++) next[index + i] = chars[i]!;
    refs.current[Math.min(index + chars.length, LENGTH - 1)]?.focus();
    commit(next);
  };

  const handleKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...value];
      if (next[index]) {
        next[index] = "";
        onChange(next);
      } else if (index > 0) {
        next[index - 1] = "";
        onChange(next);
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3" role="group" aria-label="Verification code">
      {Array.from({ length: LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={value[i] ?? ""}
          disabled={disabled}
          onChange={(e) => write(i, e.target.value)}
          onKeyDown={handleKeyDown(i)}
          onPaste={(e) => {
            e.preventDefault();
            write(0, e.clipboardData.getData("text"));
          }}
          onFocus={(e) => e.currentTarget.select()}
          inputMode="text"
          autoComplete="one-time-code"
          maxLength={LENGTH}
          aria-label={`Verification character ${i + 1}`}
          className={cn(
            "size-12 rounded-full border bg-card/60 text-center font-display text-lg font-semibold uppercase text-foreground outline-none backdrop-blur-sm sm:size-14",
            "transition-all duration-300 focus:scale-105 focus:border-primary/70 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_18%,transparent)]",
            "disabled:opacity-60",
            error ? "animate-shake border-destructive/70" : "border-border hover:border-primary/40",
            value[i] && !error && "border-primary/60",
          )}
        />
      ))}
    </div>
  );
}
