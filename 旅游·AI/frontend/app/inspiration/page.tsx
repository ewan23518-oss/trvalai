"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getInspiration } from "@/lib/api";

export default function InspirationPage() {
  const [budget, setBudget] = useState(5000);
  const [days, setDays] = useState(5);
  const [prefsRaw, setPrefsRaw] = useState("island,beach");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const preferences = prefsRaw.split(",").map((x) => x.trim()).filter(Boolean);
      setResult(await getInspiration({ budget, travel_days: days, preferences, top_k: 3 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "灵感生成失败");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="glass-strong rounded-3xl p-5">
        <h1 className="text-2xl font-bold">Inspiration（旅行灵感）</h1>
        <p className="mt-1 text-sm text-slate-700">不知道去哪时，先让 AI 给你推荐目的地。</p>
        <div className="mt-3 space-y-2">
          <input className="input-glass w-full rounded-xl p-2.5" type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} placeholder="预算" />
          <input className="input-glass w-full rounded-xl p-2.5" type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} placeholder="天数" />
          <input className="input-glass w-full rounded-xl p-2.5" value={prefsRaw} onChange={(e) => setPrefsRaw(e.target.value)} placeholder="偏好（逗号分隔，如 island,beach）" />
        </div>
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
        <button className="btn-primary mt-3 rounded-xl px-4 py-2 text-sm font-medium">生成灵感</button>
      </form>

      <section className="glass rounded-2xl p-5">
        <h2 className="text-lg font-semibold">推荐结果</h2>
        {!result ? <p className="mt-2 text-sm text-slate-700">尚未生成</p> : null}
        {result ? (
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            <p>策略：{result.strategy}</p>
            {result.recommendations.map((item: any) => (
              <div key={item.destination} className="glass-chip rounded-xl p-3">
                <p className="font-medium">{item.destination}</p>
                <p>匹配分：{item.match_score}</p>
                <p>预算估算：${item.estimated_budget}</p>
                <p>标签：{item.tags.join(" / ")}</p>
                <p>理由：{item.reason}</p>
              </div>
            ))}
            <Link href="/planning" className="btn-primary mt-2 inline-block rounded-xl px-4 py-2 text-xs">
              用推荐结果进入 Planning
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
