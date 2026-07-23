import type { ButtonHTMLAttributes } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary: "border border-indigo-700 bg-indigo-700 text-white shadow-sm hover:border-indigo-800 hover:bg-indigo-800 focus-visible:ring-indigo-500",
  secondary: "border border-indigo-100 bg-indigo-50 text-indigo-700 shadow-sm hover:border-indigo-200 hover:bg-indigo-100 focus-visible:ring-indigo-500",
  outline: "border border-slate-300 bg-white text-slate-700 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:ring-indigo-500",
  ghost: "border border-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
  danger: "border border-rose-700 bg-rose-700 text-white shadow-sm hover:border-rose-800 hover:bg-rose-800 focus-visible:ring-rose-500",
  success: "border border-emerald-600 bg-emerald-600 text-white shadow-sm hover:border-emerald-700 hover:bg-emerald-700 focus-visible:ring-emerald-500",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 min-h-9 rounded-full px-3.5 text-sm",
  md: "h-[42px] min-h-[42px] rounded-full px-4 text-sm",
  lg: "h-12 min-h-12 rounded-full px-5 text-[15px]",
  icon: "size-[42px] min-h-[42px] min-w-[42px] rounded-full p-0",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold transition duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Chargement",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, className })}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoadingSpinner label={loadingLabel} /> : children}
    </button>
  );
}

