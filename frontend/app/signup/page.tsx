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

        <div>
          <input
            className={`w-full px-4 py-2 bg-[#111a2a] border ${usernameError ? 'border-red-500' : 'border-zinc-700'}`}
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
          />
          {usernameError && (
            <div className="text-red-500 text-xs mt-1">{usernameError}</div>
          )}
        </div>

        <div>
          <input
            type="password"
            className={`w-full px-4 py-2 bg-[#111a2a] border ${passwordError ? 'border-red-500' : 'border-zinc-700'}`}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
          {passwordError && (
            <div className="text-red-500 text-xs mt-1">{passwordError}</div>
          )}
        </div>

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
