"use client";

import { cn } from "@/lib/cn";
import { tap } from "@/lib/tap";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
}

export default function Button({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      onClick={(e) => {
        tap();
        onClick?.(e);
      }}
      className={cn(
        "inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
        variant === "outline" && "border border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100",
        variant === "ghost" && "text-zinc-500 hover:text-zinc-100",
        className
      )}
      {...props}
    >
      {loading ? "…" : children}
    </button>
  );
}