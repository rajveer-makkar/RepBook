"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home01Icon, Dumbbell01Icon, Clock03Icon, Settings01Icon } from "hugeicons-react";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/dashboard", label: "Home", Icon: Home01Icon },
  { href: "/programs", label: "Programs", Icon: Dumbbell01Icon },
  { href: "/history", label: "History", Icon: Clock03Icon },
  { href: "/settings", label: "Settings", Icon: Settings01Icon },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition",
                active ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <Icon size={22} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}