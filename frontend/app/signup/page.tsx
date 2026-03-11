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
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsername(val);
    if (val.length > 0 && !/^[A-Za-z0-9]+$/.test(val)) {
      setUsernameError("Spaces are not allowed, only alphabets, numbers are allowed");
    } else {
      setUsernameError("");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (val.length > 0 && val.length < 5) {
      setPasswordError("Password must be at least 5 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleSignup = async () => {
    let isValid = true;
    
    if (!username || !/^[A-Za-z0-9]+$/.test(username)) {
      setUsernameError("Spaces are not allowed, only alphabets, numbers are allowed");
      isValid = false;
    }
    
    if (!password || password.length < 5) {
      setPasswordError("Password must be at least 5 characters");
      isValid = false;
    }

    if (!isValid) return;

    try {
      setError("");
      await register(username, password);
      router.push("/");
    } catch {
      setError("Signup failed");
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#060910] text-white overflow-hidden">
      {/* ─── Radial Glows (Theme matching) ─── */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-500/[0.05] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-100px] w-[400px] h-[400px] bg-purple-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* ─── Glassmorphism Signup Container ─── */}
      <div className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-2xl bg-white/[0.02] backdrop-blur-md border border-white/[0.08] shadow-2xl transition-all duration-500 hover:border-white/[0.12]">
        
        {/* Glow behind the box */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500/20 to-blue-500/0 rounded-2xl blur-xl opacity-30 -z-10" />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Create Account
            </span>
          </h1>
          <p className="text-sm text-gray-500">Join the intelligence platform today.</p>
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
              className={`w-full px-4 py-3 bg-white/[0.03] border ${usernameError ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.05] focus:border-indigo-500/50 hover:border-white/[0.1]'} focus:bg-white/[0.05] rounded-xl outline-none transition-all placeholder:text-gray-700 text-sm`}
              placeholder="Enter your username"
              value={username}
              onChange={handleUsernameChange}
            />
            {usernameError && (
              <div className="text-red-400 text-xs mt-1.5 ml-1">{usernameError}</div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              className={`w-full px-4 py-3 bg-white/[0.03] border ${passwordError ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.05] focus:border-indigo-500/50 hover:border-white/[0.1]'} focus:bg-white/[0.05] rounded-xl outline-none transition-all placeholder:text-gray-700 text-sm`}
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
            />
            {passwordError && (
              <div className="text-red-400 text-xs mt-1.5 ml-1">{passwordError}</div>
            )}
          </div>

          <button
            onClick={handleSignup}
            className="w-full mt-2 px-5 py-3.5 bg-gradient-to-r from-indigo-600/80 to-blue-600/70 hover:from-indigo-500 hover:to-blue-500 border border-indigo-400/25 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:-translate-y-0.5"
          >
            Create Account
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
