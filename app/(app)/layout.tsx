import { redirect } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { getUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      <div className="mx-auto max-w-4xl px-4 pt-6">{children}</div>
      <BottomNav />
    </div>
  );
}