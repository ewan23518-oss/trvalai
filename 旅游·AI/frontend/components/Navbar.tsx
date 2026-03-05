"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/inspiration", label: "Inspiration" },
  { href: "/planning", label: "Planning" },
  { href: "/optimization", label: "Optimization" },
  { href: "/budget", label: "Budget" },
  { href: "/booking", label: "Booking" },
  { href: "/assistant", label: "Travel Assistant" },
  { href: "/social", label: "Social" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-3 z-30 px-3">
      <nav className="glass mx-auto flex max-w-6xl flex-col gap-3 rounded-2xl px-4 py-3 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="text-lg font-semibold tracking-wide text-slate-900">
          AI Travel Platform
        </Link>
        <div className="flex flex-wrap gap-2 text-xs md:text-sm">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-1.5 transition ${
                  active ? "glass-chip font-medium text-slate-900" : "text-slate-700 hover:glass-chip"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
