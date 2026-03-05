import Link from "next/link";

const items = [
  { name: "机票", status: "待接入", desc: "航班搜索、比价、改签提醒" },
  { name: "酒店", status: "待接入", desc: "房型筛选、地理位置、取消政策" },
  { name: "门票/活动", status: "待接入", desc: "景点门票、体验项目、时间段预约" },
];

export default function BookingPage() {
  return (
    <div className="space-y-4">
      <section className="glass-strong rounded-3xl p-6">
        <h1 className="text-2xl font-bold">Booking（预订系统）</h1>
        <p className="mt-1 text-sm text-slate-700">当前是 MVP 占位层，已预留预订聚合接口位置。</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.name} className="glass rounded-2xl p-4">
            <p className="text-xs text-slate-500">{item.status}</p>
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <p className="mt-1 text-sm text-slate-700">{item.desc}</p>
          </article>
        ))}
      </section>

      <div className="glass rounded-2xl p-4 text-sm text-slate-700">
        你可以先在 <Link href="/planning" className="underline">Planning</Link> 与 <Link href="/budget" className="underline">Budget</Link> 完成决策，再接入真实预订源。
      </div>
    </div>
  );
}
