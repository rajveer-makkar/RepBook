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
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-800 bg-zinc-900/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold tracking-wide transition active:scale-95",
                active ? "text-zinc-100" : "text-zinc-500"
              )}
            >
              <Icon
                size={24}
                strokeWidth={active ? 2.2 : 1.8}
                className={active ? "drop-shadow-sm" : ""}
              />
              {label}
            </Link>
          );
        })}
      </div>
      {/* iOS home-indicator safe area */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}