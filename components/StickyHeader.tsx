export default function StickyHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-[max(0.75rem,env(safe-area-inset-top))] -mx-4 z-10 flex items-center justify-between bg-zinc-900/80 px-4 py-2 backdrop-blur">
      {children}
    </div>
  );
}