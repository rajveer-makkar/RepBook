import { cn } from "@/lib/cn";

const inputCls =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-600";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, props.className)} />;
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500", className)}>
      {children}
    </label>
  );
}