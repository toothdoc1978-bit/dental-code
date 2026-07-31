# Repository Guidelines & Automation Rules

## 1. Quality Assurance Commands

There is no `npm test` or `npm run lint` script in this project — do not invent
them. The real QA commands are:

- **Build check:** `npm run build`
- **Clinical logic evals (local, no API key needed):**
  `npm run eval:coding && npm run eval:conflicts && npm run eval:dentition`
- **Note-quality regression (requires `ANTHROPIC_API_KEY` in `.env`, or point
  `EVAL_URL` at a deployed instance):** `npm run eval:seed`

Run the build check and the three local evals before every push. Do not push
if any of them fail.

## 2. PHI Rules (non-negotiable)

- This app must never collect, store, or transmit PHI. No fields, fixtures,
  logs, or test data may contain patient names, DOB, Medicaid ID, SSN,
  address, or phone.
- The canonical rejected-key list lives in `server/phiGuard.js`
  (`PHI_KEYS`). The intake bridge keeps deliberate duplicates of this list in
  `api/intake-fetch.js` and `src/hooks/useChartStore.js` — defense in depth
  across independently deployable layers. If the list ever changes, change
  all three in the same commit.
- PHI guards are recursive and reject-whole (never strip-and-continue). Keep
  that posture: a PHI key arriving anywhere signals an upstream contract
  violation that must fail loudly.
- Generated notes use the literal placeholder `[PATIENT]`.

## 3. Git & Branching Strategy

- Never commit directly to `main` or `master`.
- Create feature branches using the format `<type>/<short-description>`.
  Supported types: `feat`, `fix`, `refactor`, `docs`, `chore`.
  (Hosted Claude sessions may be assigned a `claude/...` branch by the
  platform; that takes precedence when present.)

## 4. Pull Request Creation Workflow

When instructed to create a PR or submit code:

1. **Run QA:** execute the build check and local evals from section 1.
   Do not push if any fail.
2. **Push branch:** `git push -u origin HEAD`.
3. **Create the PR** using whatever GitHub access the session has —
   `gh pr create` locally, or the GitHub tools available in hosted sessions.
   Open as draft unless told otherwise.

## 5. Code Review Workflow

When asked to review a PR:

1. Fetch the PR details and comments (`gh pr view <pr_number> --comments`
   locally, or the equivalent GitHub tools).
2. Inspect the changes (`gh pr diff <pr_number>` or equivalent).
3. Review criteria: edge cases, project conventions, PHI rules (section 2),
   and whether eval coverage should grow with the change.
4. Post the review only when explicitly requested.
