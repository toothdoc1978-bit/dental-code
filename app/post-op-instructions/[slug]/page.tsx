import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostOpTemplate } from "@/components/PostOpTemplate";
import { getPostOp, postOps } from "@/lib/post-op";

export function generateStaticParams() {
  return postOps.map((p) => ({ slug: p.slug }));
}

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const p = getPostOp(params.slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.short,
    alternates: { canonical: `/post-op-instructions/${p.slug}` },
  };
}

export default function PostOpDetail({ params }: Props) {
  const p = getPostOp(params.slug);
  if (!p) notFound();
  return <PostOpTemplate p={p} />;
}
