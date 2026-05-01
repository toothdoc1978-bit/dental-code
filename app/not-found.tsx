import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-ink">Page not found</h1>
      <p className="mt-3 text-ink-muted">The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex">
        Back to home
      </Link>
    </section>
  );
}
