import type { MetadataRoute } from "next";
import { postOps } from "@/lib/post-op";
import { services } from "@/lib/services";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/about",
    "/services",
    "/smile-gallery",
    "/patient-forms",
    "/post-op-instructions",
    "/pricing",
    "/blog",
    "/reviews",
    "/contact",
    "/privacy-policy",
    "/accessibility",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));
  const postOpRoutes: MetadataRoute.Sitemap = postOps.map((p) => ({
    url: `${base}/post-op-instructions/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));
  return [...staticRoutes, ...serviceRoutes, ...postOpRoutes];
}
