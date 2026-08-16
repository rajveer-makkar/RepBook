import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import SyncPending from "@/components/SyncPending";
import { getUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

return (
    <div className="min-h-dvh bg-zinc-900">
      <div className="mx-auto w-full max-w-md px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-28">
        {children}
      </div>
      <BottomNav />
      <SyncPending />
    </div>
  );
}