import Link from "next/link";

const modules = [
  { key: "Inspiration", href: "/inspiration", desc: "发现目的地灵感、主题旅行与热门线路。" },
  { key: "Planning", href: "/planning", desc: "按日期、预算、风格自动生成可执行行程。" },
  { key: "Optimization", href: "/optimization", desc: "自动优化景点顺序，减少来回折返。" },
  { key: "Budget", href: "/budget", desc: "拆解机票、酒店、餐饮、门票、交通成本。" },
  { key: "Booking", href: "/booking", desc: "统一预订入口（机票/酒店/门票）与状态跟踪。" },
  { key: "Travel Assistant", href: "/assistant", desc: "聊天式助手，实时修改行程和答疑。" },
  { key: "Social", href: "/social", desc: "一键生成小红书、朋友圈、PDF与分享素材。" },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="glass-strong rounded-3xl p-8">
        <p className="glass-chip inline-flex rounded-full px-3 py-1 text-xs tracking-wide text-slate-700">Platform Blueprint</p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">AI Travel Platform</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          Inspiration → Planning → Optimization → Budget → Booking → Travel Assistant → Social
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <article key={m.key} className="glass rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">{m.key}</h2>
            <p className="mt-2 text-sm text-slate-700">{m.desc}</p>
            <Link href={m.href} className="btn-primary mt-4 inline-block rounded-xl px-4 py-2 text-sm font-medium">
              进入模块
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
