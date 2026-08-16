import { cn } from "@/lib/cn";

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
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex w-full items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-zinc-900 text-white hover:bg-zinc-700",
        variant === "outline" && "border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 hover:text-zinc-900",
        variant === "ghost" && "text-zinc-600 hover:text-zinc-900",
        className
      )}
      {...props}
    >
      {loading ? "…" : children}
    </button>
  );
}