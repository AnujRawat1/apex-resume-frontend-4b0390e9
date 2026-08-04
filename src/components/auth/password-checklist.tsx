import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const PASSWORD_RULES = [
  { id: "length", label: "Minimum 8 characters", test: (v: string) => v.length >= 8 },
  { id: "upper", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "lower", label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { id: "digit", label: "One digit", test: (v: string) => /\d/.test(v) },
  {
    id: "special",
    label: "One special character",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const;

export function isStrongPassword(value: string) {
  return PASSWORD_RULES.every((rule) => rule.test(value));
}

export function PasswordChecklist({ value }: { value: string }) {
  return (
    <ul className="grid gap-1.5 pt-0.5 sm:grid-cols-2" aria-live="polite">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.id}
            className={cn(
              "flex items-center gap-1.5 text-[11.5px] transition-colors duration-300",
              ok ? "text-success" : "text-muted-foreground/70",
            )}
          >
            <span
              className={cn(
                "grid size-4 shrink-0 place-items-center rounded-full transition-all duration-300",
                ok
                  ? "scale-100 bg-success/15 text-success"
                  : "bg-muted-foreground/10 text-muted-foreground/70",
              )}
            >
              {ok ? <Check className="size-3" /> : <X className="size-3" />}
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
