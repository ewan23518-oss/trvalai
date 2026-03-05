"use client";

import { FormEvent, useState } from "react";
import { chatWithAI, getAssistantContext } from "@/lib/api";

export default function AssistantPage() {
  const [destination, setDestination] = useState("东京");
  const [travelDate, setTravelDate] = useState("2026-04-10");
  const [transportMode, setTransportMode] = useState<"walk" | "subway" | "taxi">("subway");
  const [hasBooking, setHasBooking] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  const [tripId, setTripId] = useState(1);
  const [message, setMessage] = useState("把下午博物馆换成购物街，并推荐附近晚餐");
  const [chatResult, setChatResult] = useState("");
  const [error, setError] = useState("");

  const onAlertSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await getAssistantContext({
        destination,
        travel_date: travelDate,
        transport_mode: transportMode,
        has_restaurant_booking: hasBooking,
      });
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提醒生成失败");
    }
  };

  const onChatSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setChatResult("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("缺少登录 token，请先去 Planning 页面生成一次行程。");
      return;
    }

    try {
      const data = await chatWithAI(token, { trip_id: tripId, message });
      setChatResult(`${data.reply}\n${data.suggested_changes.join(" | ")}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "助手调用失败");
    }
  };

  return (
    <div className="space-y-4">
      {error ? <p className="glass rounded-xl px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={onAlertSubmit} className="glass-strong rounded-3xl p-5">
          <h1 className="text-2xl font-bold">Travel Assistant（旅行助手）</h1>
          <p className="mt-1 text-sm text-slate-700">地铁、预约、天气、拥挤提醒。</p>
          <div className="mt-3 space-y-2">
            <input className="input-glass w-full rounded-xl p-2.5" value={destination} onChange={(e) => setDestination(e.target.value)} />
            <input className="input-glass w-full rounded-xl p-2.5" type="date" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
            <select className="select-glass w-full rounded-xl p-2.5" value={transportMode} onChange={(e) => setTransportMode(e.target.value as any)}>
              <option value="walk">步行</option>
              <option value="subway">地铁</option>
              <option value="taxi">打车</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={hasBooking} onChange={(e) => setHasBooking(e.target.checked)} />
              已完成餐厅预约
            </label>
          </div>
          <button className="btn-primary mt-3 rounded-xl px-4 py-2 text-sm font-medium">生成提醒</button>
        </form>

        <section className="glass rounded-2xl p-5">
          <h2 className="text-lg font-semibold">旅行提醒</h2>
          {!alerts.length ? <p className="mt-2 text-sm text-slate-700">尚未生成</p> : null}
          <div className="mt-2 space-y-2">
            {alerts.map((a, idx) => (
              <div key={`${a.title}-${idx}`} className="glass-chip rounded-xl p-3 text-sm text-slate-700">
                <p className="font-medium">[{a.category}] {a.title}</p>
                <p>{a.detail}</p>
                <p className="text-xs text-slate-500">级别：{a.severity}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={onChatSubmit} className="glass rounded-2xl p-5">
          <h2 className="text-lg font-semibold">行程内对话助手</h2>
          <div className="mt-3 space-y-2">
            <input className="input-glass w-full rounded-xl p-2.5" type="number" min={1} value={tripId} onChange={(e) => setTripId(Number(e.target.value))} placeholder="行程 ID" />
            <textarea className="input-glass h-28 w-full rounded-xl p-2.5" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <button className="btn-primary mt-3 rounded-xl px-4 py-2 text-sm font-medium">发送给助手</button>
        </form>

        <section className="glass rounded-2xl p-5">
          <h2 className="text-lg font-semibold">助手回复</h2>
          {!chatResult ? <p className="mt-2 text-sm text-slate-700">尚未返回</p> : null}
          {chatResult ? <pre className="glass-chip mt-2 whitespace-pre-wrap rounded-xl p-3 text-sm">{chatResult}</pre> : null}
        </section>
      </div>
    </div>
  );
}
