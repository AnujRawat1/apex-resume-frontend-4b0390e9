import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | undefined;
};

export function Field({ label, error, className, id, type, ...props }: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword ? (show ? "text" : "password") : type}
          className={cn(
            "peer h-12 w-full rounded-xl border bg-card px-4 text-[15px] text-foreground outline-none transition-all duration-300 placeholder:text-muted-foreground/70",
            "focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]",
            isPassword && "pr-12",
            error ? "border-destructive" : "border-border hover:border-primary/50",
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        )}
      </div>
      {error && <p className="animate-fade-up text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
