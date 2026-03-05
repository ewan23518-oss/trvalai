"use client";

import { FormEvent, useState } from "react";
import { BudgetPayload, calculateBudget } from "@/lib/api";

export default function BudgetPage() {
  const [form, setForm] = useState<BudgetPayload>({
    destination: "东京",
    departure_city: "上海",
    travel_days: 5,
    travelers: 2,
    travel_style: "food",
    total_budget: 5000,
  });
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setResult(await calculateBudget(form));
    } catch (err) {
      setError(err instanceof Error ? err.message : "预算计算失败");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="glass-strong rounded-3xl p-5">
        <h1 className="text-2xl font-bold">Budget（预算评估）</h1>
        <p className="mt-1 text-sm text-slate-700">自动估算机票、酒店、餐饮、门票、交通并给出节省建议。</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input className="input-glass rounded-xl p-2.5" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          <input className="input-glass rounded-xl p-2.5" value={form.departure_city} onChange={(e) => setForm({ ...form, departure_city: e.target.value })} />
          <input className="input-glass rounded-xl p-2.5" type="number" value={form.travel_days} onChange={(e) => setForm({ ...form, travel_days: Number(e.target.value) })} />
          <input className="input-glass rounded-xl p-2.5" type="number" value={form.travelers} onChange={(e) => setForm({ ...form, travelers: Number(e.target.value) })} />
          <input className="input-glass rounded-xl p-2.5" value={form.travel_style} onChange={(e) => setForm({ ...form, travel_style: e.target.value })} />
          <input className="input-glass rounded-xl p-2.5" type="number" value={form.total_budget ?? ""} onChange={(e) => setForm({ ...form, total_budget: Number(e.target.value) || undefined })} />
        </div>
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
        <button className="btn-primary mt-3 rounded-xl px-4 py-2 text-sm font-medium">开始评估</button>
      </form>

      <section className="glass rounded-2xl p-5">
        <h2 className="text-lg font-semibold">预算结果</h2>
        {!result ? <p className="mt-2 text-sm text-slate-700">尚未生成</p> : null}
        {result ? (
          <div className="mt-2 space-y-2 text-sm text-slate-700">
            <p>预估总计：${result.estimated_total}</p>
            <p>日均预算：${result.estimated_daily_budget}</p>
            {result.budget_gap !== null ? <p>差额：${result.budget_gap}</p> : null}
            <p>建议：{result.suggestion}</p>
            {result.breakdown.map((item: any) => (
              <div key={item.category} className="glass-chip rounded-xl p-2">
                {item.category}：${item.amount}（{item.note}）
              </div>
            ))}
            {result.saving_tips?.length ? (
              <div className="glass-chip rounded-xl p-2">
                <p className="font-medium">节省建议</p>
                <ul className="list-disc pl-4">
                  {result.saving_tips.map((tip: string) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
