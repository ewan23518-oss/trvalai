"use client";

import { FormEvent, useMemo, useState } from "react";
import { RoutePoint, optimizeRoute } from "@/lib/api";

function parsePoints(raw: string): RoutePoint[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, lat, lng] = line.split(",").map((p) => p.trim());
      return { name, latitude: Number(lat), longitude: Number(lng) };
    });
}

export default function OptimizationPage() {
  const [destination, setDestination] = useState("东京");
  const [day, setDay] = useState(1);
  const [objective, setObjective] = useState<"shortest_path" | "least_time" | "least_transfer">("shortest_path");
  const [transportMode, setTransportMode] = useState<"walk" | "subway" | "taxi">("subway");
  const [pointsRaw, setPointsRaw] = useState("浅草寺,35.7148,139.7967\n东京塔,35.6586,139.7454\n涩谷十字路口,35.6595,139.7005");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const pointCount = useMemo(() => parsePoints(pointsRaw).length, [pointsRaw]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await optimizeRoute({
        destination,
        day,
        attractions: parsePoints(pointsRaw),
        objective,
        transport_mode: transportMode,
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "路线优化失败");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="glass-strong rounded-3xl p-5">
        <h1 className="text-2xl font-bold">Optimization（路线优化）</h1>
        <p className="mt-1 text-sm text-slate-700">支持最短路径、最少时间、最少换乘和多交通模式。</p>
        <div className="mt-3 space-y-2">
          <input className="input-glass w-full rounded-xl p-2.5" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <input className="input-glass w-full rounded-xl p-2.5" type="number" value={day} min={1} onChange={(e) => setDay(Number(e.target.value))} />
          <select className="select-glass w-full rounded-xl p-2.5" value={objective} onChange={(e) => setObjective(e.target.value as any)}>
            <option value="shortest_path">最短路径</option>
            <option value="least_time">最少时间</option>
            <option value="least_transfer">最少换乘</option>
          </select>
          <select className="select-glass w-full rounded-xl p-2.5" value={transportMode} onChange={(e) => setTransportMode(e.target.value as any)}>
            <option value="walk">步行</option>
            <option value="subway">地铁</option>
            <option value="taxi">打车</option>
          </select>
          <textarea className="input-glass h-36 w-full rounded-xl p-2.5" value={pointsRaw} onChange={(e) => setPointsRaw(e.target.value)} />
          <p className="text-xs text-slate-600">已识别 {pointCount} 个景点（每行：名称,纬度,经度）</p>
        </div>
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
        <button className="btn-primary mt-3 rounded-xl px-4 py-2 text-sm font-medium">开始优化</button>
      </form>

      <section className="glass rounded-2xl p-5">
        <h2 className="text-lg font-semibold">优化结果</h2>
        {!result ? <p className="mt-2 text-sm text-slate-700">尚未生成</p> : null}
        {result ? (
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            <p>总距离：{result.total_distance_km} km</p>
            <p>总耗时：{result.estimated_total_minutes} 分钟</p>
            <p>策略：{result.strategy}</p>
            {result.optimized_route.map((item: any, idx: number) => (
              <div key={`${item.name}-${idx}`} className="glass-chip rounded-xl p-2">
                {idx + 1}. {item.name} | {item.distance_from_previous_km} km | 约 {item.estimated_travel_minutes} 分钟
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
