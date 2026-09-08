# Leaderboard + Round Management

Drop the `src/` folder into your project root, merging rather than overwriting
any file you already have (`types/team.ts`, `lib/firebase/admin.ts`,
`lib/utils.ts`, `lib/auth/*` — these are provided as working fallbacks in case
you don't already have them).

## 1. Install

```
npm install firebase-admin
```

## 2. Env vars (server-only, .env.local)

```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## 3. Make a user an admin

Custom claims can only be set from a trusted server context (not the client).
One-off script:

```ts
import { adminAuth } from "@/lib/firebase/admin";
await adminAuth.setCustomUserClaims("<uid>", { admin: true });
```

The user needs to log out/in (or refresh their ID token) after this for the
claim to show up in `requireAdmin()`.

## 4. How it works

**Rounds** — `rounds` collection. Only one can have `status: "active"` at a
time; `PATCH /api/rounds` enforces this in a transaction (activating one
completes whichever was active). Admin-only to create/update/delete;
read-only (`GET`) for any logged-in user.

**Scoring** — fully manual, per your call: admins add/deduct points for a
team via `POST /api/leaderboard`, applied to whichever round is currently
active. Each adjustment is logged to `teams/{teamId}/roundScores/{roundId}`
(audit trail — who, when, note) and the team's `totalPoints` is updated in
the same transaction.

**Leaderboard** — computed on read (`lib/firestore/leaderboard.ts`), not
stored. Sorted by `totalPoints` descending. Color rule as specified:
- rank 1–5 → always green
- last 2 ranks → red (unless already green, for small team counts)
- everything else → yellow

**No real-time listeners** — per your answer, both the team dashboard and
admin leaderboard use a manual "Refresh" button / fetch-on-load rather than
Firestore `onSnapshot`. If you change your mind later, swap the `fetch` calls
in `app/dashboard/leaderboard/page.tsx` and `app/admin/leaderboard/page.tsx`
for an `onSnapshot` listener on the `teams` collection.

## 5. Assumptions to double check against your actual codebase

- `hooks/useTeam.ts` is assumed to return `{ team: { id, name, ... } | null }`
  for the logged-in team — used only to highlight "(you)" on the dashboard
  leaderboard. Adjust the import/shape if yours differs.
- `types/team.ts` needs a `totalPoints: number` field — merge into your
  existing Team type if you already have one.
- Session-cookie auth (`lib/firebase/auth.ts`) assumes you're already setting
  a `session` cookie at login via Firebase's session-cookie flow. If your
  `app/api/auth/route.ts` does something different, point `requireUser`/
  `requireAdmin` at whatever you already use to identify the caller instead.

## 6. Theme tokens used (matches the "Alice in Hackerland" landing page)

| Token | Value |
|---|---|
| Background | `#0a0a0a` |
| Text (primary) | `#f0e6d3` |
| Accent (red) | `red-600` / `red-500` (Tailwind) |
| Borders | `white/10` – `white/15` |
| Labels/mono | `font-mono`, `uppercase`, `tracking-wider`, small + muted |
| Rank green | `emerald-400/500` |
| Rank yellow | `amber-300/400` |
| Rank red | `red-400/500` |
