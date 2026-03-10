"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

/* ─────────── Animated Counter ─────────── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

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
    }, 25);
    return () => clearInterval(counter);
  }, [value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ─────────── Capability Card ─────────── */
function CapabilityCard({
  icon,
  title,
  description,
  tags,
  onClick,
  accentColor = "blue",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
  onClick: () => void;
  accentColor?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "from-blue-500/10 to-transparent border-blue-500/20 hover:border-blue-500/40",
    red: "from-red-500/10 to-transparent border-red-500/20 hover:border-red-500/40",
    amber: "from-amber-500/10 to-transparent border-amber-500/20 hover:border-amber-500/40",
    emerald: "from-emerald-500/10 to-transparent border-emerald-500/20 hover:border-emerald-500/40",
    purple: "from-purple-500/10 to-transparent border-purple-500/20 hover:border-purple-500/40",
  };

  return (
    <div
      onClick={onClick}
      className={`group relative bg-gradient-to-br ${colorMap[accentColor]} border rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]`}
    >
      <div className="mb-5 text-3xl">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed mb-5">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] uppercase tracking-widest text-gray-500 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="absolute top-6 right-6 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs tracking-widest uppercase">
        Open →
      </div>
    </div>
  );
}

/* ─────────── Main Page ─────────── */
export default function Home() {
  const router = useRouter();
  const [underlineWidth, setUnderlineWidth] = useState(0);

  useEffect(() => {
    setTimeout(() => setUnderlineWidth(280), 300);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#05070c] via-[#080d18] to-[#0a0f1c]">
      {/* ─── Background Effects ─── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/[0.04] blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-red-500/[0.03] blur-[140px] rounded-full pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-10 py-24">
        {/* ═══════════════════════════════════════════ */}
        {/*                 HERO SECTION               */}
        {/* ═══════════════════════════════════════════ */}
        <div className="mb-20">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-blue-500/50" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-blue-400/80 font-medium">
              Enterprise Compliance Platform
            </span>
          </div>

          <div className="relative inline-block mb-6">
            <h1 className="text-6xl md:text-7xl font-semibold tracking-tight leading-[1.1]">
              Supplier Risk
              <br />
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>
            <div
              className="h-[3px] bg-gradient-to-r from-blue-500 to-transparent mt-5 transition-all duration-1000 ease-out"
              style={{ width: underlineWidth }}
            />
          </div>

          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed mb-10">
            Sanctions screening, Section 889 compliance, entity resolution, and
            multi-tier supply chain graph analytics — powered by real-time AI risk
            scoring and continuous monitoring.
          </p>

          {/* ─── CTA Buttons ─── */}
          <div className="flex items-center gap-4 mb-12">
            <button
              onClick={() => router.push("/suppliers")}
              className="relative px-8 py-3.5 bg-gradient-to-r from-indigo-600/80 to-blue-600/70 hover:from-indigo-500/90 hover:to-blue-500/80 border border-indigo-400/20 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                View Suppliers
              </span>
            </button>

            <button
              onClick={() => router.push("/comparison")}
              className="px-8 py-3.5 border border-zinc-700 hover:border-zinc-500 text-gray-300 hover:text-white text-sm font-medium rounded-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Compare Suppliers
            </button>

            <button
              onClick={() => router.push("/admin")}
              className="px-8 py-3.5 border border-zinc-800 hover:border-zinc-600 text-gray-500 hover:text-gray-300 text-sm font-medium rounded-xl transition-all duration-300"
            >
              Admin Config
            </button>
          </div>

          {/* ─── Animated Stats ─── */}
          <div className="flex gap-12">
            {[
              { value: 4, suffix: "", label: "Risk Modules", sub: "Sanctions · 889 · News · Graph" },
              { value: 100, suffix: "+", label: "Suppliers Tracked", sub: "Global coverage" },
              { value: 4, suffix: "-tier", label: "Graph Depth", sub: "Entity network analysis" },
              { value: 24, suffix: "/7", label: "Monitoring", sub: "Continuous compliance" },
            ].map((stat, i) => (
              <div key={i} className="group">
                <p className="text-2xl font-semibold text-white font-mono">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-gray-400 mt-0.5">{stat.label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Divider ─── */}
        <div className="relative mb-16">
          <div className="border-t border-zinc-800/70" />
          <div className="absolute left-0 top-0 w-24 h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/*              PLATFORM CAPABILITIES         */}
        {/* ═══════════════════════════════════════════ */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-6 bg-gray-600" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">
              Platform Capabilities
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CapabilityCard
              icon={
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Supplier Registry"
              description="Manage your supplier portfolio with entity resolution, identity deduplication, and multi-tenant isolation."
              tags={["Entity Resolution", "Multi-Tenant", "NAICS"]}
              onClick={() => router.push("/suppliers")}
              accentColor="blue"
            />

            <CapabilityCard
              icon={
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
              title="Risk Assessment"
              description="Run weighted risk scoring across sanctions, Section 889, negative media, and graph-based entity networks."
              tags={["OFAC", "Section 889", "Weighted Scoring"]}
              onClick={() => router.push("/suppliers")}
              accentColor="red"
            />

            <CapabilityCard
              icon={
                <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Supplier Comparison"
              description="Benchmark suppliers side-by-side with delta comparison across all compliance dimensions and scoring versions."
              tags={["Delta Analysis", "Side-by-Side", "History"]}
              onClick={() => router.push("/comparison")}
              accentColor="amber"
            />

            <CapabilityCard
              icon={
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
              title="Entity Network Graph"
              description="Visualize multi-tier ownership, subsidiaries, and partner relationships with trust propagation scoring."
              tags={["Neo4j", "Trust Scoring", "4-Tier Traversal"]}
              onClick={() => router.push("/suppliers")}
              accentColor="emerald"
            />

            <CapabilityCard
              icon={
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Compliance Screening"
              description="Automated sanctions list screening (OFAC, BIS, UN, EU) and Section 889 prohibited equipment checks."
              tags={["OFAC SDN", "BIS", "889(a)(1)(A)"]}
              onClick={() => router.push("/suppliers")}
              accentColor="purple"
            />

            <CapabilityCard
              icon={
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Admin & Configuration"
              description="Manage scoring weights, audit logs, ingestion feeds, and trust model parameters for your organization."
              tags={["Scoring Config", "Audit Trail", "RBAC"]}
              onClick={() => router.push("/admin")}
              accentColor="blue"
            />
          </div>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/*            HOW IT WORKS SECTION            */}
        {/* ═══════════════════════════════════════════ */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-6 bg-gray-600" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">
              How Risk Scoring Works
            </span>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Register Supplier",
                desc: "Add a supplier with name, country, and industry. The system resolves the entity to a global canonical identity.",
              },
              {
                step: "02",
                title: "Run Assessment",
                desc: "The engine screens against OFAC/BIS sanctions, Section 889 rules, negative media, and graph relationships.",
              },
              {
                step: "03",
                title: "Weighted Scoring",
                desc: "Each risk factor has a configurable weight. Points are aggregated into a 0–100 risk score with full explainability.",
              },
              {
                step: "04",
                title: "Continuous Monitoring",
                desc: "Risk scores update as new sanctions, media signals, and entity relationships are detected across the network.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-white/[0.04] mb-3 font-mono">
                  {item.step}
                </div>
                <h4 className="text-sm font-semibold text-gray-200 mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div className="border-t border-zinc-800/50 pt-8 flex items-center justify-between text-xs text-gray-600">
          <span>Supplier Risk Intelligence Platform</span>
          <span>Built with Next.js · FastAPI · Neo4j · PostgreSQL</span>
        </div>
      </div>
    </main>
  );
}
