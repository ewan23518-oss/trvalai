"use client";

import { useEffect, useMemo, useState } from "react";
import { chatWithAI, getTrip } from "@/lib/api";

type TripDetail = {
  id: number;
  destination: string;
  departure_city: string;
  budget: number;
  travel_style: string;
  travelers: number;
  total_estimated_cost: number;
  days: Array<{
    id: number;
    day_number: number;
    summary: string;
    attractions: Array<{
      name: string;
      map_link: string;
      distance_from_prev_km: number;
    }>;
    restaurants: Array<{
      name: string;
      map_link: string;
    }>;
  }>;
};

const styleMap: Record<string, string> = {
  luxury: "奢华",
  backpacking: "背包",
  food: "美食",
  family: "亲子",
  adventure: "冒险",
};

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [chatMsg, setChatMsg] = useState("把博物馆换成购物街");
  const [chatResult, setChatResult] = useState("");
  const [error, setError] = useState("");

  const tripId = useMemo(() => Number(params.id), [params.id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("未登录，请先去“行程规划”页面登录。");
      return;
    }

    getTrip(token, tripId)
      .then(setTrip)
      .catch(() => setError("加载行程失败，请稍后再试。"));
  }, [tripId]);

  const submitChat = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await chatWithAI(token, { trip_id: tripId, message: chatMsg });
      setChatResult(`${response.reply}\n${response.suggested_changes.join(" | ")}`);
    } catch {
      setChatResult("修改请求提交失败，请检查后端服务状态。");
    }
  };

  const exportPlan = () => {
    if (!trip) return;
    const data = JSON.stringify(trip, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trip-${trip.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) return <p className="glass rounded-xl px-4 py-3 text-rose-700">{error}</p>;
  if (!trip) return <p className="glass inline-block rounded-xl px-4 py-3">加载中...</p>;

  return (
    <div className="space-y-6">
      <section className="glass-strong rounded-3xl p-5">
        <h1 className="text-2xl font-bold">{trip.destination} 行程详情</h1>
        <p className="text-sm text-slate-700">
          出发地：{trip.departure_city} | 风格：{styleMap[trip.travel_style] ?? trip.travel_style} | 人数：{trip.travelers}
        </p>
        <p className="mt-2 text-sm text-slate-800">预估总费用：${trip.total_estimated_cost}</p>
        <button onClick={exportPlan} className="btn-primary mt-3 rounded-xl px-3 py-2 text-sm font-medium">
          导出行程（JSON）
        </button>
      </section>

      <section className="space-y-4">
        {trip.days.map((day) => (
          <div key={day.id} className="glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold">第 {day.day_number} 天</h2>
            <p className="text-sm text-slate-700">{day.summary}</p>

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-medium">景点安排</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {day.attractions.map((a, idx) => (
                    <li key={`${a.name}-${idx}`} className="glass-chip rounded-xl p-2.5">
                      <p>{a.name}</p>
                      <p className="text-slate-600">与上一站距离：{a.distance_from_prev_km} km</p>
                      <a className="text-sky-700 underline" href={a.map_link} target="_blank">
                        查看地图
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium">餐厅推荐</h3>
                <ul className="mt-2 space-y-2 text-sm">
                  {day.restaurants.map((r, idx) => (
                    <li key={`${r.name}-${idx}`} className="glass-chip rounded-xl p-2.5">
                      <p>{r.name}</p>
                      <a className="text-sky-700 underline" href={r.map_link} target="_blank">
                        查看地图
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="glass rounded-2xl p-5">
        <h2 className="text-lg font-semibold">AI 行程助手</h2>
        <p className="text-sm text-slate-700">用自然语言修改行程，例如“把下午博物馆换成购物街”。</p>
        <div className="mt-3 flex gap-2">
          <input className="input-glass flex-1 rounded-xl p-2.5" value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} />
          <button onClick={submitChat} className="btn-primary rounded-xl px-3 py-2 text-sm font-medium">
            发送
          </button>
        </div>
        {chatResult ? <pre className="glass-chip mt-3 whitespace-pre-wrap rounded-xl p-3 text-sm">{chatResult}</pre> : null}
      </section>
    </div>
  );
}


