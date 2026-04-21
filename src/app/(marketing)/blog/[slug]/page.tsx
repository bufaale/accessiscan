import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, POSTS } from "@/content/blog/registry";

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} | AccessiScan`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { Component } = post;

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-[780px] px-6 py-16">
        <Link
          href="/blog"
          className="text-sm text-[#06b6d4] hover:underline"
        >
          ← All posts
        </Link>

        <header className="mt-6 border-b border-slate-200 pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#06b6d4]">
            AccessiScan · {post.date} · {post.readMinutes} min read
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-[#0b1f3a] sm:text-5xl">
            {post.title}
          </h1>
        </header>

        <div className="mt-10">
          <Component />
        </div>

        <div className="mt-14 rounded-md border border-[#06b6d4]/30 bg-[#06b6d4]/5 p-6">
          <p className="font-display text-lg font-semibold text-[#0b1f3a]">
            Free WCAG scan + VPAT in 60 seconds
          </p>
          <p className="mt-2 text-sm text-slate-700">
            No credit card. From $19/month when you need deep scans, continuous
            monitoring, and an EN 301 549 Conformance Report.
          </p>
          <Link
            href="/signup"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-[#0b1f3a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#071428]"
          >
            Start a free scan
          </Link>
        </div>
      </div>
    </main>
  );
}
