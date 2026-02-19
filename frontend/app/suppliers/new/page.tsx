"use client";

import { useState } from "react";
import { supplierAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewSupplierPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const resolve = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await supplierAPI.resolveIdentity(name);
      setMatches(res.data.matches || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    await supplierAPI.create({
      name,
      country,
      industry,
    });
    router.push("/suppliers");
  };

  return (
    <main className="min-h-screen bg-[#070b12] text-white flex items-center justify-center px-6">

      <div className="w-full max-w-2xl space-y-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-semibold">
            Register Supplier
          </h1>
          <p className="text-gray-500 text-sm">
            Identity resolution and canonical mapping enabled
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">

          <input
            className="w-full px-4 py-3 bg-[#0e1623] border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition"
            placeholder="Supplier Name"
            onBlur={() => {
              if (name.trim().length > 3) {
                resolve();
              }

            }}
            onChange={e => setName(e.target.value)}
          />

          {loading && (
            <div className="text-xs text-gray-500">
              Resolving identity...
            </div>
          )}

          {matches.length > 0 && (
            <div className="border border-zinc-800 rounded-lg p-4 bg-[#0b111b]">
              <div className="text-xs uppercase text-gray-500 mb-3">
                Possible Matches
              </div>

              {matches.map((m, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm py-2 border-b border-zinc-800 last:border-none"
                >
                  <span>{m.canonical_name}</span>
                  <span className="text-gray-400">
                    {(m.confidence * 100).toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          <input
            className="w-full px-4 py-3 bg-[#0e1623] border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition"
            placeholder="Country"
            onChange={e => setCountry(e.target.value)}
          />

          <input
            className="w-full px-4 py-3 bg-[#0e1623] border border-zinc-800 rounded-lg focus:outline-none focus:border-white transition"
            placeholder="Industry"
            onChange={e => setIndustry(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 rounded-lg border border-white hover:bg-white hover:text-black transition"
          >
            Create Supplier
          </button>
        </div>
      </div>
    </main>
  );
}
