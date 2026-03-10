"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════
   ANIMATED NEURAL NETWORK BACKGROUND
   ═══════════════════════════════════════════════════════════ */
function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create nodes
    const count = 60;
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(99, 130, 255, ${0.06 * (1 - dist / 180)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw & move nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(130, 160, 255, 0.15)";
        ctx.fill();
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   ANIMATED NUMBER
   ═══════════════════════════════════════════════════════════ */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
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
    }, 25);
    return () => clearInterval(counter);
  }, [value]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   RISK MODULE PILL (animated on hover)
   ═══════════════════════════════════════════════════════════ */
function RiskPill({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-300 hover:scale-105 cursor-default ${color}`}
    >
      <span className="text-sm">{icon}</span>
      <span className="text-xs font-medium tracking-wide">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const router = useRouter();
  const [underlineWidth, setUnderlineWidth] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
    setTimeout(() => setUnderlineWidth(320), 500);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060910]">
      {/* ─── Neural Network Background ─── */}
      <NeuralCanvas />

      {/* ─── Radial Glows ─── */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-500/[0.05] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-cyan-500/[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] right-[-100px] w-[400px] h-[400px] bg-purple-500/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-12 pt-16 pb-20">
        {/* ═══════════════════════════════════════════ */}
        {/*                 HERO SECTION               */}
        {/* ═══════════════════════════════════════════ */}
        <section
          className={`transition-all duration-1000 ease-out ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-emerald-400/40" />
              <div className="w-2 h-2 rounded-full bg-emerald-400/20" />
            </div>
            <span className="text-[11px] uppercase tracking-[0.25em] text-emerald-400/70 font-medium">
              System Active — Real-time Intelligence
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6">
            <span className="text-white/90">Supplier</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Risk Intelligence
            </span>
          </h1>

          <div
            className="h-[2px] bg-gradient-to-r from-indigo-500 via-blue-500 to-transparent mb-8 transition-all duration-1000 ease-out"
            style={{ width: underlineWidth }}
          />

          <p className="text-base md:text-lg text-gray-400/90 max-w-2xl leading-relaxed mb-10">
            AI-powered compliance engine that screens suppliers against global
            sanctions lists, Section 889 regulations, adverse media, and maps
            multi-tier entity networks — delivering explainable, weighted risk
            scores in real time.
          </p>

          {/* ─── CTA Buttons ─── */}
          <div className="flex items-center gap-4 mb-16">
            <button
              onClick={() => router.push("/suppliers")}
              className="group relative px-8 py-3.5 bg-gradient-to-r from-indigo-600/80 to-blue-600/70 hover:from-indigo-500 hover:to-blue-500 border border-indigo-400/25 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_25px_rgba(99,102,241,0.2)] hover:shadow-[0_0_35px_rgba(99,102,241,0.3)]"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                View Suppliers
                <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            <button
              onClick={() => router.push("/comparison")}
              className="px-7 py-3.5 border border-zinc-700/70 hover:border-zinc-500 text-gray-400 hover:text-white text-sm font-medium rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.03]"
            >
              Compare Suppliers
            </button>

            <button
              onClick={() => router.push("/admin")}
              className="px-7 py-3.5 text-gray-600 hover:text-gray-400 text-sm font-medium rounded-xl transition-all duration-300"
            >
              Admin Config →
            </button>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/*          RISK MODULES SHOWCASE             */}
        {/* ═══════════════════════════════════════════ */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-6 bg-gray-700" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-medium">
              Risk Modules
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mb-12">
            <RiskPill
              icon="🛡️"
              label="OFAC / SDN Sanctions"
              color="bg-red-500/[0.06] border-red-500/20 text-red-300"
            />
            <RiskPill
              icon="📋"
              label="Section 889 Compliance"
              color="bg-amber-500/[0.06] border-amber-500/20 text-amber-300"
            />
            <RiskPill
              icon="📰"
              label="Adverse Media Signals"
              color="bg-purple-500/[0.06] border-purple-500/20 text-purple-300"
            />
            <RiskPill
              icon="🔗"
              label="Entity Network Graph"
              color="bg-cyan-500/[0.06] border-cyan-500/20 text-cyan-300"
            />
            <RiskPill
              icon="⚖️"
              label="Weighted Scoring Engine"
              color="bg-indigo-500/[0.06] border-indigo-500/20 text-indigo-300"
            />
            <RiskPill
              icon="📊"
              label="PDF Risk Dossier"
              color="bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-300"
            />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 4, suffix: "", label: "Risk Modules", sub: "Sanctions · 889 · News · Graph", icon: "🔬" },
              { value: 100, suffix: "+", label: "Suppliers Tracked", sub: "Global entity coverage", icon: "🏢" },
              { value: 4, suffix: "-Tier", label: "Graph Depth", sub: "Neo4j entity traversal", icon: "🕸️" },
              { value: 24, suffix: "/7", label: "Monitoring", sub: "Continuous compliance", icon: "📡" },
            ].map((stat, i) => (
              <div
                key={i}
                className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="text-xl mb-3">{stat.icon}</div>
                <p className="text-2xl font-bold text-white font-mono tracking-tight">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-gray-300 mt-1">{stat.label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Divider ─── */}
        <div className="relative mb-16">
          <div className="border-t border-zinc-800/50" />
          <div className="absolute left-0 top-0 w-32 h-px bg-gradient-to-r from-indigo-500/40 to-transparent" />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/*            PLATFORM CAPABILITIES           */}
        {/* ═══════════════════════════════════════════ */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-gray-700" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-medium">
              Platform
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-10">
            Everything you need to assess supplier risk.
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: "Supplier Registry",
                desc: "Register, search, and manage suppliers with entity resolution and multi-tenant isolation.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                color: "text-blue-400",
                borderColor: "hover:border-blue-500/30",
                route: "/suppliers",
              },
              {
                title: "Risk Assessment",
                desc: "Run weighted scoring with transparent factor-by-factor explainability and PDF dossier export.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                color: "text-red-400",
                borderColor: "hover:border-red-500/30",
                route: "/suppliers",
              },
              {
                title: "Supplier Comparison",
                desc: "Benchmark suppliers side-by-side across compliance dimensions and scoring history.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                color: "text-amber-400",
                borderColor: "hover:border-amber-500/30",
                route: "/comparison",
              },
              {
                title: "Entity Network Graph",
                desc: "Visualize ownership chains, subsidiaries, and partners with trust propagation across 4 tiers.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
                color: "text-cyan-400",
                borderColor: "hover:border-cyan-500/30",
                route: "/suppliers",
              },
              {
                title: "Compliance Screening",
                desc: "Automated checks against OFAC SDN, BIS Entity List, UN/EU sanctions, and Section 889.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ),
                color: "text-purple-400",
                borderColor: "hover:border-purple-500/30",
                route: "/suppliers",
              },
              {
                title: "Scoring & Admin",
                desc: "Configure risk weights, review audit logs, and manage scoring model parameters.",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                color: "text-emerald-400",
                borderColor: "hover:border-emerald-500/30",
                route: "/admin",
              },
            ].map((card) => (
              <div
                key={card.title}
                onClick={() => router.push(card.route)}
                className={`group p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] ${card.borderColor} hover:bg-white/[0.04] cursor-pointer transition-all duration-300 hover:-translate-y-0.5`}
              >
                <div className={`${card.color} mb-4 opacity-80 group-hover:opacity-100 transition-opacity`}>
                  {card.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-2 group-hover:text-gray-100">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/*            HOW IT WORKS PIPELINE           */}
        {/* ═══════════════════════════════════════════ */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-6 bg-gray-700" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-medium">
              Pipeline
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white/90 mb-10">
            From registration to continuous risk monitoring.
          </h2>

          <div className="grid grid-cols-4 gap-4">
            {[
              {
                step: "01",
                title: "Register",
                desc: "Add supplier with name, country, industry. Auto-resolves to canonical entity.",
                color: "from-blue-500/10",
              },
              {
                step: "02",
                title: "Screen",
                desc: "Engine checks OFAC, BIS, UN/EU sanctions, Section 889, and adverse media feeds.",
                color: "from-red-500/10",
              },
              {
                step: "03",
                title: "Score",
                desc: "Configurable weights per factor. Transparent 0–100 score with full reason explainability.",
                color: "from-purple-500/10",
              },
              {
                step: "04",
                title: "Monitor",
                desc: "Continuous re-assessment as new sanctions, news, and entity relationships are detected.",
                color: "from-emerald-500/10",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`relative p-5 rounded-xl bg-gradient-to-b ${item.color} to-transparent border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300`}
              >
                <div className="text-4xl font-black text-white/[0.06] font-mono mb-2">
                  {item.step}
                </div>
                <h4 className="text-sm font-bold text-white/90 mb-2">
                  {item.title}
                </h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {item.desc}
                </p>
                {i < 3 && (
                  <div className="absolute right-[-12px] top-1/2 -translate-y-1/2 text-gray-700 text-lg z-10">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-zinc-800/40 pt-8 flex items-center justify-between text-[11px] text-gray-700">
          <span className="tracking-wider uppercase">
            Supplier Risk Intelligence Platform
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 animate-pulse" />
            <span>Next.js · FastAPI · Neo4j · PostgreSQL</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
