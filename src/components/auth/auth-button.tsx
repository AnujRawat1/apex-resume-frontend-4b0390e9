import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

type AuthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "ghost";
  icon?: ReactNode;
};

export function AuthButton({
  loading = false,
  loadingText,
  variant = "primary",
  icon,
  className,
  children,
  disabled,
  ...props
}: AuthButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading}
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl text-[15px] font-semibold",
        "transition-all duration-300 ease-out will-change-transform",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-gradient-primary text-primary-foreground glow-primary hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] disabled:hover:translate-y-0",
        variant === "ghost" &&
          "glass-panel text-foreground hover:border-primary/45 hover:bg-primary/10 active:scale-[0.985]",
        className,
      )}
    >
      {loading ? <Spinner /> : icon}
      <span>{loading ? (loadingText ?? "Please wait…") : children}</span>
    </button>
  );
}
