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