"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = value / 40;

    const counter = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplay(value);
        clearInterval(counter);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 20);

    return () => clearInterval(counter);
  }, [value]);

  return <span>{display}</span>;
}

export default function Home() {
  const router = useRouter();
  const [underlineWidth, setUnderlineWidth] = useState(0);

  // Search and Identity Resolution State
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [confirmEntity, setConfirmEntity] = useState<any | null>(null);

  useEffect(() => {
    setTimeout(() => setUnderlineWidth(220), 300);
  }, []);

  return (
    <main className="relative min-h-screen px-10 py-24 overflow-hidden bg-gradient-to-b from-[#05070c] to-[#0a0f1c]">

      {/* Subtle Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-500/5 blur-[140px] rounded-full pointer-events-none" />

      {/* Faint Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">

        {/* HERO SECTION */}
        <div className="space-y-10 mb-16">

          <div className="relative inline-block">
            <h1 className="text-6xl font-semibold tracking-tight leading-tight">
              Supplier Risk Intelligence
            </h1>

            {/* Animated Underline */}
            <div
              className="h-[3px] bg-white/70 mt-4 transition-all duration-700 ease-out"
              style={{ width: underlineWidth }}
            />
          </div>

          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
            Real-time compliance monitoring, multi-tier risk graph analytics,
            and AI-powered executive reporting designed for enterprise
            supply chains.
          </p>

          {/* Search Bar & Auto-Complete */}
          <div className="pt-2 relative z-10">
            <div className="flex bg-white/5 border border-white/20 rounded-xl overflow-hidden focus-within:border-white/50 focus-within:ring-4 focus-within:ring-white/10 transition-all max-w-3xl">
              <div className="flex-1 flex items-center px-4">
                <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  placeholder="Search supplier by name, trade name, country, or commodity code..."
                  className="w-full bg-transparent border-none text-white placeholder-gray-500 focus:outline-none py-4 text-base"
                  onChange={(e) => {
                    // Mocking search behavior: if length > 2, show mock results
                    if (e.target.value.length > 2) {
                      setSearchResults([
                        { id: '1', name: "Acme Steel, LLC", country: "United States", industry: "Manufacturing", website: "acmesteelllc.com" },
                        { id: '2', name: "Acme Steel Inc (Shanghai)", country: "China", industry: "Manufacturing", website: "acmesteel.cn" },
                      ]);
                    } else {
                      setSearchResults([]);
                    }
                  }}
                />
              </div>
              <button
                onClick={() => router.push("/suppliers/new")}
                className="px-6 py-4 border-l border-white/20 hover:bg-white/10 text-sm font-medium transition"
              >
                Register New
              </button>
            </div>

            {/* Disambiguation UI */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 max-w-3xl bg-[#0b111b] border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800 text-xs font-medium text-gray-500 uppercase tracking-widest flex justify-between">
                  <span>Match Candidates Found</span>
                  <span>{searchResults.length} Results</span>
                </div>
                <ul className="max-h-[300px] overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <li
                      key={idx}
                      className="px-5 py-4 border-b border-zinc-800/50 hover:bg-white/5 cursor-pointer flex items-center justify-between group transition-colors"
                      onClick={() => {
                        // Action on confirming the entity
                        console.log(`Selecting: ${result.name}`);

                        // FR-1.1.2 The system shall allow the user to confirm the correct entity before running an assessment.
                        setConfirmEntity(result);
                        setSearchResults([]); // Hide dropdown
                        router.push(`/assessment/${result.id}`);
                      }}
                    >
                      <div>
                        <div className="font-semibold text-white text-base group-hover:text-blue-400 transition-colors">
                          {result.name}
                        </div>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">📍 {result.country}</span>
                          <span className="flex items-center gap-1">🏢 {result.industry}</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-xs text-gray-400 mb-1">{result.website}</span>
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2 py-0.5 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">Select Entity →</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Confirmation Modal Logic can go here or directly route */}
          </div>

          {/* Micro Animated Stats */}
          <div className="flex gap-16 pt-8 text-sm text-gray-400">
            <div>
              <p className="text-2xl font-semibold text-white">
                <AnimatedNumber value={24} />/7
              </p>
              <p>Monitoring</p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-white">
                <AnimatedNumber value={1} /> AI
              </p>
              <p>Risk Engine</p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-white">
                <AnimatedNumber value={3} />
              </p>
              <p>Multi-Tier Layers</p>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-zinc-800/70 mb-16" />

        {/* GLASS CARDS */}
        <div className="grid md:grid-cols-3 gap-10">

          <div
            onClick={() => router.push("/suppliers")}
            className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-10 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
          >
            <h2 className="text-xl font-semibold mb-4">
              Suppliers
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Manage suppliers and initiate structured risk assessments.
            </p>
          </div>

          <div
            onClick={() => router.push("/comparison")}
            className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-10 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
          >
            <h2 className="text-xl font-semibold mb-4">
              Comparison
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Benchmark suppliers side-by-side across compliance metrics.
            </p>
          </div>

          <div
            onClick={() => router.push("/monitor")}
            className="group backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-10 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)]"
          >
            <h2 className="text-xl font-semibold mb-4">
              Live Monitoring
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Continuous event-based compliance signal streaming.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}
