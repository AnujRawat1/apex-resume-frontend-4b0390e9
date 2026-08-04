import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  error?: string | undefined;
};

export function AuthInput({ label, icon, error, className, id, type, ...props }: AuthInputProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="block text-[13px] font-medium text-muted-foreground">
        {label}
      </label>
      <div className={cn("relative", error && "animate-shake")}>
        <input
          id={inputId}
          type={isPassword ? (show ? "text" : "password") : type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "peer h-12 w-full rounded-2xl border bg-card/60 text-[15px] text-foreground outline-none backdrop-blur-sm",
            "transition-all duration-300 placeholder:text-muted-foreground/60",
            "focus:border-primary/70 focus:bg-card/80 focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_16%,transparent)]",
            icon ? "pl-11" : "pl-4",
            isPassword ? "pr-12" : "pr-4",
            error ? "border-destructive/70" : "border-border hover:border-primary/40",
            className,
          )}
          {...props}
        />
        {icon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-300 peer-focus:text-primary [&_svg]:size-[18px]"
          >
            {icon}
          </span>
        )}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        )}
      </div>
      {error && (
        <p
          id={errorId}
          role="alert"
          className="animate-fade-up text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
