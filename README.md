# Chad Gardner, DDS — Practice Website

Marketing site for **Chad Gardner, DDS** in Bastrop, Louisiana. Built with Next.js 14 (App Router), TypeScript, and Tailwind CSS.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in Resend keys when ready
npm run dev                  # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production server (after build) |
| `npm run lint` | ESLint + Next.js config |
| `npm run typecheck` | `tsc --noEmit` |

## Project structure

```
app/                      App Router routes + server actions
  layout.tsx              Header/Footer/SEO/JSON-LD
  page.tsx                Home
  about/                  About page
  services/               Services index + dynamic detail pages
  smile-gallery/          Filterable before/after gallery
  reviews/                Patient testimonials
  contact/                Contact form (Resend server action)
  sitemap.ts              SEO sitemap
  robots.ts               SEO robots
components/               Shared UI (Header, Footer, ContactForm, etc.)
lib/                      Single source of truth for content
  site.ts                 Practice NAP, hours, technology, highlights
  services.ts             Service slugs + copy + FAQs
  gallery.ts              Smile-gallery cases + filters
  testimonials.ts         Patient quotes
public/
  gallery/                Drop before/after JPGs here
  team/                   Drop dentist + team photos here
  office/                 Drop office interior photos here
  og/                     Social-share image
```

## Photos

See `public/IMAGES.md` for the exact filenames the site references.

## Contact form (Resend)

The form is a Next.js server action in `app/contact/actions.ts` and validated with `zod`. To enable email delivery:

1. Sign up at [resend.com](https://resend.com) and create an API key.
2. Verify a sender domain (e.g. `chadgardnerdds.com`).
3. Set these in `.env.local` (and your hosting provider):

```
RESEND_API_KEY=re_xxxxxxxx
CONTACT_TO_EMAIL=info@chadgardnerdds.com
CONTACT_FROM_EMAIL=no-reply@chadgardnerdds.com
```

If the API key is missing, the form will still submit cleanly but tell the patient to call instead.

## Deploy

The build is portable. Recommended hosts:

- **Vercel** — zero-config for Next.js, free tier, custom domain support.
- **Netlify** — also works with the official Next.js plugin.
- **Cloudflare Pages** — works with `@cloudflare/next-on-pages`.

After connecting the repo, set the same env vars from `.env.example` in the host's dashboard.

## Things still TODO before launch

- [ ] Drop real images into `public/gallery`, `public/team`, `public/office`, `public/og` (see `public/IMAGES.md`)
- [ ] Confirm office hours in `lib/site.ts`
- [ ] Add Google Business Profile URL to `site.social.google` in `lib/site.ts`
- [ ] Add Facebook/Instagram URLs if applicable
- [ ] Verify domain in Resend and set the env vars
- [ ] Buy/connect domain and deploy
