# Vercel bootstrap deploy

Production for this app lives in the Vercel project `dental-code` (team
`toothdoc1978-9755s-projects`, project id `prj_yslFdCcF3jVTuP3cLehPIcZVGpSz`,
domain https://dental-code.vercel.app). That project is **not git-linked** to
this repository, so merging to `main` deploys nothing by itself. Two deploy
paths exist:

| Path | Needs | When to use |
|------|-------|-------------|
| **This bootstrap** (`deploy/vercel-bootstrap/`) | Only the ability to create a deployment on the project, e.g. the hosted assistant's Vercel connector, or any client of the deployments API | Default. First used 2026-09-03; verified live the same day. |
| Root `deploy.mjs` | A `VERCEL_TOKEN` + `VERCEL_TEAM`, run locally | Token-based alternative. Uploads the tracked tree minus `package-lock.json`, `deploy.mjs`, and `README.md` (so that path builds with an unpinned `npm install`) and already passes `forceNew=1` (see the URL in that script), so the stamp rule below does not apply to it. |

## What the bootstrap does

Two files are uploaded as the deployment source: `package.json` and
`build.mjs`. Nothing else. At build time, inside Vercel's build container,
`build.mjs`:

1. Clones this public repository at `main` into `app/`. `SOURCE_BRANCH`
   overrides the ref; see the note below before using it.
2. Runs `npm ci` and `npm run build` there, passing the cloned commit as
   `VERCEL_GIT_COMMIT_SHA` so the header badge in the app reads
   `v<version> · <sha>` for the commit actually deployed, where `<sha>` is
   the first 7 characters of the commit (for example `v0.2.0 · 04af106`).
3. Copies `app/dist` to `.vercel/output/static`.
4. Bundles every `api/*.js` handler found in the clone with esbuild (from
   the cloned app's `node_modules`) into
   `.vercel/output/functions/api/<name>.func/index.mjs` and writes the
   matching `.vc-config.json`. The list is discovered from the directory, so
   a handler added on `main` is picked up automatically; the build fails if
   none are found.
5. Writes `.vercel/output/config.json` (Build Output API v3): static files and
   functions first, unknown `/api/*` paths return 404, everything else falls
   back to `index.html` for the SPA router.

Two details are load-bearing. The esbuild `--banner:js` adds a `createRequire`
shim because the bundles contain `@anthropic-ai/sdk` (CommonJS) and plain ESM
output would throw on dynamic `require` of Node builtins. `shouldAddHelpers:
true` in `.vc-config.json` is what gives the handlers their Express-style
`req.body`, `req.query`, and `res.status().json()`.

Runtime configuration such as `ANTHROPIC_API_KEY` comes from the project's
environment variables, not from these files. Never put secrets in them.

Node versions are split on purpose: `build.mjs` runs on the project's Node.js
setting in Vercel (24.x at the time of writing), while the functions run on
`nodejs22.x` pinned in `.vc-config.json` with esbuild targeting `node22`.
Change both deliberately if you change either. Every deploy is a cold
`npm ci` inside `app/` (the clone is deleted at the start of each build), so
Vercel's build cache never applies to it; expect a few seconds, not minutes.

**`SOURCE_BRANCH`** is read from the deployment's environment, which for
Vercel means a project environment variable that persists across uploads.
Scope it to the Preview environment only, or unset it before the production
upload, or production will silently build that branch (the header badge SHA
is the only tell). It accepts a branch or tag name, not a commit SHA; a bad
value fails the build at the clone step.

## How to deploy

Upload the two files to project name `dental-code` with these deployment
project settings:

```
framework:     null
buildCommand:  node build.mjs
installCommand, outputDirectory, rootDirectory: default (null)
```

With the hosted assistant, that is one `deploy_to_vercel` call carrying the
two file contents. With the raw API, mirror `deploy.mjs`: POST to
`/v13/deployments?teamId=team_ZdXKnoJ4cyoVTztHFqXoLK5U&forceNew=1&skipAutoDetectionConfirmation=1`
with a body carrying `name: "dental-code"`,
`project: "prj_yslFdCcF3jVTuP3cLehPIcZVGpSz"`, `target`, the project settings
above, and the two files. Without `teamId` a personal-scope token deploys to
the wrong account.

**Sequence: preview first, then production.** Deploy with target `preview`,
run the checks below against the preview URL, then deploy again with target
`production`. The production domain switches only when the production build
is READY, and the previous production deployment stays available as an
instant rollback in the Vercel dashboard.

## The `bootstrapStamp` rule

Vercel deduplicates a deployment whose uploaded files are byte-identical to a
previous deployment on the same target: it returns the earlier deployment
instead of building again. Because these two files never change on their own,
a repeat upload would silently keep the **old** build live even though `main`
has moved. The hosted deploy tool has no force flag, so the guard is the
`bootstrapStamp` field in `package.json`: **set it to a new value on every
upload** (the target commit SHA is the natural choice, a timestamp also
works). A changed stamp changes the file hash, which defeats deduplication.
`deploy.mjs` does not need this because it sends `forceNew=1`.

## Post-deploy checks

Run these against the preview URL, then again against
https://dental-code.vercel.app after the production deploy:

- The header badge shows `v<version> · <sha>` where `<sha>` is the first 7
  characters of the current `main` commit. If it shows the old commit, the
  upload was deduplicated: change the stamp and deploy again.
- `POST /api/generate-note` with `{"chartData":{"medicalHistory":{"patientName":"x"}}}`
  returns HTTP 400 with `PHI field "patientName" not permitted` (recursive
  PHI guard is live).
- `GET /api/generate-note` returns 405; `GET /api/does-not-exist` returns 404;
  a deep path such as `/note` returns the SPA `index.html` with 200.
- `GET /api/intake-fetch?code=ABCD-1234` returns 500 `intake bridge not
  configured` until the intake middleware env vars exist on the project.

## Verifying the bootstrap locally

Needs network access for the clone. Paths are anchored on the script's own
directory, so it is safe to run from anywhere, but the commands below assume
this directory:

```bash
node build.mjs
ls .vercel/output/config.json .vercel/output/functions/api/*/index.mjs
```

Then invoke a bundle the way Vercel's runtime will:

```bash
node --input-type=module -e "
const h = (await import('./.vercel/output/functions/api/generate-note.func/index.mjs')).default
const res = { status(c){ this.code = c; return this }, json(b){ this.body = b; return this }, setHeader(){} }
await h({ method: 'POST', body: { chartData: { medicalHistory: { patientName: 'x' } } } }, res)
console.log(res.code, res.body)   // expect 400 { error: 'PHI field \"patientName\" not permitted' }
"
```

`app/` and `.vercel/` under this directory are gitignored; delete them freely.
