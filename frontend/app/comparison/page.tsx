"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";

import AnimatedCounter from "@/components/ui/AnimatedCounter";
import DeltaIndicator from "@/components/ui/DeltaIndicator";

type Metrics = {
  risk_score: number;
  sanctions_count: number;
  section_rank: number;
  graph_exposure: number;
  news_signal: number;
};

type SupplierData = {
  id: number;
  name: string;
  metrics: Metrics;
  decision_score: number;
};

type CompareResponse = {
  supplier_a?: SupplierData;
  supplier_b?: SupplierData;
  comparison?: {
    winner: string;
    score_difference: number;
    confidence_percent: number;
    interpretation: string;
  };
  delta_breakdown?: any;
  error?: string;
};

export default function ComparisonPage() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids");

  const [data, setData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ids) {
      setLoading(false);
      return;
    }

    const [a, b] = ids.split(",");

    api
      .get(`/suppliers/compare?supplier_a=${a}&supplier_b=${b}`)
      .then((res) => setData(res.data))
      .catch(() => setData({ error: "Failed to load comparison." }))
      .finally(() => setLoading(false));
  }, [ids]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading comparison...
      </div>
    );

  if (!ids)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        No supplier IDs provided.
      </div>
    );

  if (data?.error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {data.error}
      </div>
    );

  if (!data?.supplier_a || !data?.supplier_b)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Invalid comparison data received.
      </div>
    );

  const a = data.supplier_a;
  const b = data.supplier_b;

  const winner = data.comparison?.winner;

  return (
    <main className="min-h-screen px-12 py-16 bg-[#070b12] text-white space-y-16">

      {/* HEADER */}
      <div className="space-y-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          Supplier Comparison
        </h1>

        {data.comparison && (
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <div>
              Winner:{" "}
              <span className="text-green-400 font-medium">
                {winner}
              </span>
            </div>
            <div>
              Score Difference:{" "}
              <span className="text-white">
                {data.comparison.score_difference}
              </span>
            </div>
            <div>
              Confidence:{" "}
              <span className="text-white">
                {data.comparison.confidence_percent}%
              </span>
            </div>
          </div>
        )}

        {data.comparison?.interpretation && (
          <p className="text-zinc-500 text-sm max-w-3xl">
            {data.comparison.interpretation}
          </p>
        )}
      </div>

      {/* SUPPLIER GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {[a, b].map((supplier) => {
          const isWinner = supplier.name === winner;

          return (
            <div
              key={supplier.id}
              className="bg-[#0c121c] border border-zinc-800 rounded-xl p-8 space-y-6 relative"
            >
              {isWinner && (
                <div className="absolute top-4 right-4 px-3 py-1 text-xs bg-green-600 text-white rounded-full">
                  WINNER
                </div>
              )}

              <div>
                <h2 className="text-2xl font-semibold">
                  {supplier.name}
                </h2>
              </div>

              {/* Risk Score */}
              <div className="space-y-2">
                <div className="text-sm text-zinc-500">Risk Score</div>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold">
                    <AnimatedCounter
                      value={supplier.metrics.risk_score}
                    />
                  </div>
                </div>
              </div>

              {/* Decision Score */}
              <div className="space-y-2">
                <div className="text-sm text-zinc-500">
                  Decision Score
                </div>
                <div className="text-xl font-semibold text-indigo-400">
                  {supplier.decision_score}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <MetricBox
                  label="Sanctions"
                  value={supplier.metrics.sanctions_count}
                />
                <MetricBox
                  label="Graph Exposure"
                  value={supplier.metrics.graph_exposure}
                />
                <MetricBox
                  label="Section 889 Rank"
                  value={supplier.metrics.section_rank}
                />
                <MetricBox
                  label="News Signal"
                  value={supplier.metrics.news_signal}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* DELTA BREAKDOWN */}
      {data.delta_breakdown && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">
            Metric Breakdown
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(data.delta_breakdown).map(
              ([metric, values]: any) => (
                <div
                  key={metric}
                  className="bg-[#0c121c] border border-zinc-800 rounded-xl p-6 space-y-4"
                >
                  <div className="text-sm uppercase tracking-wider text-zinc-500">
                    {metric.replace("_", " ")}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>{values.supplier_a}</span>
                    <span>{values.supplier_b}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DeltaIndicator value={values.difference} />
                    <span className="text-xs text-zinc-400">
                      Weight: {values.weight}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-500">
                    Better:{" "}
                    <span className="text-white">
                      {values.better_supplier}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

    </main>
  );
}

/* ===========================
   Metric Box Component
=========================== */

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="bg-[#101726] border border-zinc-800 rounded-lg p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-lg font-semibold">
        {value}
      </div>
    </div>
  );
}