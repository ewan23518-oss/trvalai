"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CommunityPostPayload,
  GuidePayload,
  commentCommunityPost,
  copyCommunityRoute,
  createCommunityPost,
  favoriteCommunityPost,
  generateGuides,
  getCommunityPosts,
  likeCommunityPost,
} from "@/lib/api";

export default function SocialPage() {
  const [form, setForm] = useState<GuidePayload>({
    destination: "东京",
    departure_city: "上海",
    travel_days: 5,
    travel_style: "动漫",
    budget_per_person: 2500,
    highlights: ["秋叶原", "涩谷", "镰仓"],
  });
  const [highlightsRaw, setHighlightsRaw] = useState("秋叶原,涩谷,镰仓");
  const [postForm, setPostForm] = useState<CommunityPostPayload>({
    user_name: "旅行者",
    title: "东京5天路线",
    content: "动漫+美食线，节奏舒适。",
    route_summary: "浅草寺 -> 东京塔 -> 秋叶原 -> 镰仓",
  });

  const [guideResult, setGuideResult] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  const loadPosts = async () => {
    try {
      setPosts(await getCommunityPosts());
    } catch {
      setPosts([]);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const onGuideSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const highlights = highlightsRaw.split(",").map((s) => s.trim()).filter(Boolean);
      setGuideResult(await generateGuides({ ...form, highlights }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "攻略生成失败");
    }
  };

  const onPostSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createCommunityPost(postForm);
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败");
    }
  };

  const onLike = async (id: number) => {
    await likeCommunityPost(id);
    await loadPosts();
  };

  const onFavorite = async (id: number) => {
    await favoriteCommunityPost(id);
    await loadPosts();
  };

  const onCopy = async (id: number) => {
    const copied = await copyCommunityRoute(id);
    alert(`已复制路线：${copied.route_summary}`);
  };

  const onComment = async (id: number) => {
    if (!commentText.trim()) return;
    await commentCommunityPost(id, commentText.trim());
    setCommentText("");
    await loadPosts();
  };

  return (
    <div className="space-y-4">
      <section className="glass-strong rounded-3xl p-6">
        <h1 className="text-2xl font-bold">Social（攻略社区）</h1>
        <p className="mt-1 text-sm text-slate-700">生成内容 + 社区分享 + 复制路线 + 收藏评论。</p>
      </section>

      {error ? <p className="glass rounded-xl px-4 py-3 text-sm text-rose-700">{error}</p> : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={onGuideSubmit} className="glass rounded-2xl p-5">
          <h2 className="text-lg font-semibold">攻略生成器</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            <input className="input-glass rounded-xl p-2.5" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            <input className="input-glass rounded-xl p-2.5" value={form.departure_city} onChange={(e) => setForm({ ...form, departure_city: e.target.value })} />
            <input className="input-glass rounded-xl p-2.5" type="number" value={form.travel_days} onChange={(e) => setForm({ ...form, travel_days: Number(e.target.value) })} />
            <input className="input-glass rounded-xl p-2.5" value={form.travel_style} onChange={(e) => setForm({ ...form, travel_style: e.target.value })} />
            <input className="input-glass rounded-xl p-2.5" type="number" value={form.budget_per_person} onChange={(e) => setForm({ ...form, budget_per_person: Number(e.target.value) })} />
            <input className="input-glass rounded-xl p-2.5" value={highlightsRaw} onChange={(e) => setHighlightsRaw(e.target.value)} placeholder="亮点逗号分隔" />
          </div>
          <button className="btn-primary mt-3 rounded-xl px-4 py-2 text-sm font-medium">生成攻略</button>
        </form>

        <form onSubmit={onPostSubmit} className="glass rounded-2xl p-5">
          <h2 className="text-lg font-semibold">发布到社区</h2>
          <div className="mt-3 space-y-2">
            <input className="input-glass w-full rounded-xl p-2.5" value={postForm.user_name} onChange={(e) => setPostForm({ ...postForm, user_name: e.target.value })} />
            <input className="input-glass w-full rounded-xl p-2.5" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
            <textarea className="input-glass h-24 w-full rounded-xl p-2.5" value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} />
            <textarea className="input-glass h-20 w-full rounded-xl p-2.5" value={postForm.route_summary} onChange={(e) => setPostForm({ ...postForm, route_summary: e.target.value })} />
          </div>
          <button className="btn-primary mt-3 rounded-xl px-4 py-2 text-sm font-medium">发布路线</button>
        </form>
      </section>

      {guideResult ? (
        <section className="glass rounded-2xl p-5 text-sm text-slate-700">
          <h3 className="font-semibold">生成结果：{guideResult.title}</h3>
          <p className="mt-2">路线摘要：{guideResult.route_summary}</p>
          <p className="mt-2 whitespace-pre-wrap">{guideResult.xiaohongshu_post}</p>
          <a className="btn-primary mt-3 inline-block rounded-xl px-3 py-1.5 text-xs" href={`${apiBase}${guideResult.pdf_download_url}`} target="_blank" rel="noreferrer">
            下载 PDF 行程
          </a>
        </section>
      ) : null}

      <section className="glass rounded-2xl p-5">
        <h2 className="text-lg font-semibold">社区内容</h2>
        {!posts.length ? <p className="mt-2 text-sm text-slate-700">暂无内容</p> : null}
        <div className="mt-2 space-y-3">
          {posts.map((p) => (
            <article key={p.id} className="glass-chip rounded-xl p-3 text-sm text-slate-700">
              <p className="font-medium">{p.title} · {p.user_name}</p>
              <p>{p.content}</p>
              <p className="text-xs text-slate-500">路线：{p.route_summary}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button className="btn-ghost rounded-lg px-2 py-1 text-xs" onClick={() => onLike(p.id)}>点赞 {p.likes}</button>
                <button className="btn-ghost rounded-lg px-2 py-1 text-xs" onClick={() => onFavorite(p.id)}>收藏 {p.favorites}</button>
                <button className="btn-ghost rounded-lg px-2 py-1 text-xs" onClick={() => onCopy(p.id)}>复制路线</button>
              </div>
              <div className="mt-2 flex gap-2">
                <input className="input-glass flex-1 rounded-lg px-2 py-1 text-xs" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="写评论" />
                <button className="btn-primary rounded-lg px-2 py-1 text-xs" onClick={() => onComment(p.id)}>评论</button>
              </div>
              {p.comments?.length ? (
                <ul className="mt-2 list-disc pl-4 text-xs">
                  {p.comments.map((c: string, idx: number) => (
                    <li key={`${p.id}-${idx}`}>{c}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
