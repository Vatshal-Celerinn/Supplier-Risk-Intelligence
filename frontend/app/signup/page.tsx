"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      setError("");
      await register(username, password);
      router.push("/suppliers");
    } catch {
      setError("Signup failed");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#070b12] text-white">
      <div className="w-96 space-y-6">
        <h1 className="text-2xl font-semibold">Sign Up</h1>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <input
          className="w-full px-4 py-2 bg-[#111a2a] border border-zinc-700"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="w-full px-4 py-2 bg-[#111a2a] border border-zinc-700"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full px-4 py-2 border border-white hover:bg-white hover:text-black transition"
        >
          Create Account
        </button>

        <div className="text-sm text-[var(--text-muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-500 hover:underline"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
