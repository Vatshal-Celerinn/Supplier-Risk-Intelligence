"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navItem = (href: string, label: string) => {
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={`px-4 py-2 rounded-md text-sm transition-all ${
          active
            ? "bg-white/10 text-white"
            : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="border-b border-[var(--border-subtle)] backdrop-blur-md bg-black/60 px-10 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* Left Section */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight"
          >
            Vendor Risk Intelligence
          </Link>

          {user && (
            <div className="flex items-center gap-2">
              {navItem("/suppliers", "Suppliers")}
              {navItem("/comparison", "Comparison")}
              {navItem("/assessment/new", "New Assessment")}

              {user.role === "ADMIN" &&
                navItem("/admin/config", "Admin Config")}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-sm text-[var(--text-muted)]">
                {user.username} ({user.role})
              </div>

              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md transition"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
