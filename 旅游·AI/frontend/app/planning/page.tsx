"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createTrip, login, register, TripPayload } from "@/lib/api";

const initialTrip: TripPayload = {
  destination: "东京",
  departure_city: "上海",
  start_date: "2026-04-10",
  end_date: "2026-04-14",
  travel_days: 5,
  budget: 2500,
  travel_style: "food",
  travelers: 2,
};

const styleMap: Record<string, string> = {
  luxury: "奢华",
  backpacking: "背包",
  food: "美食",
  family: "亲子",
  adventure: "冒险",
};

export default function PlanningPage() {
  const [trip, setTrip] = useState<TripPayload>(initialTrip);
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("secret123");
  const [fullName, setFullName] = useState("演示用户");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      try {
        await register({ email, password, full_name: fullName });
      } catch {
        // 已存在时继续登录
      }

      const auth = await login({ email, password });
      localStorage.setItem("token", auth.access_token);

      const created = await createTrip(auth.access_token, trip);
      localStorage.setItem("latest_trip_id", String(created.id));

      const savedTrips = JSON.parse(localStorage.getItem("saved_trips") || "[]") as number[];
      if (!savedTrips.includes(created.id)) {
        localStorage.setItem("saved_trips", JSON.stringify([...savedTrips, created.id]));
      }

      router.push(`/trip/${created.id}`);
    } catch {
      setError("创建行程失败，请检查后端服务或登录信息。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-strong mx-auto max-w-3xl rounded-3xl p-6">
      <h1 className="text-2xl font-bold">Planning（行程规划）</h1>
      <p className="mt-1 text-sm text-slate-700">填写偏好后，系统会自动生成完整日程。</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input className="input-glass rounded-xl p-2.5" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input-glass rounded-xl p-2.5" placeholder="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="input-glass rounded-xl p-2.5 md:col-span-2" placeholder="姓名" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input className="input-glass rounded-xl p-2.5" placeholder="目的地" value={trip.destination} onChange={(e) => setTrip({ ...trip, destination: e.target.value })} />
          <input className="input-glass rounded-xl p-2.5" placeholder="出发城市" value={trip.departure_city} onChange={(e) => setTrip({ ...trip, departure_city: e.target.value })} />
          <input className="input-glass rounded-xl p-2.5" type="date" value={trip.start_date} onChange={(e) => setTrip({ ...trip, start_date: e.target.value })} />
          <input className="input-glass rounded-xl p-2.5" type="date" value={trip.end_date} onChange={(e) => setTrip({ ...trip, end_date: e.target.value })} />
          <input className="input-glass rounded-xl p-2.5" type="number" placeholder="旅行天数" value={trip.travel_days} onChange={(e) => setTrip({ ...trip, travel_days: Number(e.target.value) })} />
          <input className="input-glass rounded-xl p-2.5" type="number" placeholder="预算（USD）" value={trip.budget} onChange={(e) => setTrip({ ...trip, budget: Number(e.target.value) })} />
          <select className="select-glass rounded-xl p-2.5" value={trip.travel_style} onChange={(e) => setTrip({ ...trip, travel_style: e.target.value })}>
            <option value="luxury">{styleMap.luxury}</option>
            <option value="backpacking">{styleMap.backpacking}</option>
            <option value="food">{styleMap.food}</option>
            <option value="family">{styleMap.family}</option>
            <option value="adventure">{styleMap.adventure}</option>
          </select>
          <input className="input-glass rounded-xl p-2.5" type="number" placeholder="出行人数" value={trip.travelers} onChange={(e) => setTrip({ ...trip, travelers: Number(e.target.value) })} />
        </div>

        {error ? <p className="glass rounded-xl px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <button className="btn-primary w-full rounded-xl px-4 py-2.5 font-semibold" disabled={loading}>
          {loading ? "AI 正在生成行程..." : "生成行程"}
        </button>
      </form>
    </div>
  );
}
