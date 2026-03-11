"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace(redirect);
    }
  }, [user, router, redirect]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await login(username.trim(), password.trim());

      // redirect handled by useEffect after user updates
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError("Invalid credentials");
      } else if (err?.response?.status === 422) {
        setError("Invalid request format");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#060910] text-white overflow-hidden">
      {/* ─── Radial Glows (Theme matching) ─── */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-500/[0.05] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-100px] w-[400px] h-[400px] bg-purple-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* ─── Glassmorphism Login Container ─── */}
      <div className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/[0.08] shadow-2xl transition-all duration-500 hover:border-white/[0.12]">
        
        {/* Glow behind the box */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/20 to-blue-500/0 rounded-2xl blur-xl opacity-30 -z-10" />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h1>
          <p className="text-sm text-gray-500">Sign in to access your intelligence dashboard.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Username</label>
            <input
              value={username}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.05] focus:border-indigo-500/50 focus:bg-white/[0.05] hover:border-white/[0.1] rounded-xl outline-none transition-all placeholder:text-gray-700 text-sm"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              value={password}
              type="password"
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.05] focus:border-indigo-500/50 focus:bg-white/[0.05] hover:border-white/[0.1] rounded-xl outline-none transition-all placeholder:text-gray-700 text-sm"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={submitting}
            onClick={handleLogin}
            className="w-full mt-2 px-5 py-3.5 bg-gradient-to-r from-indigo-600/80 to-blue-600/70 hover:from-indigo-500 hover:to-blue-500 border border-indigo-400/25 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : "Secure Login"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-sm text-gray-500">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors font-medium"
            >
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
