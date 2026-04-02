# CLAUDE.md — Pause Mantra

This file configures Claude Code's behaviour for the Pause Mantra project.
Read it fully before generating any code. All instructions here override general defaults.

---

## Project Overview

**Pause Mantra** is a React Native (Expo) mobile app that gates access to distracting apps behind mindfulness mantras. It targets iOS 16+ and Android 13+. The full product spec lives in `PRD.md` — read the relevant section before implementing any feature.

**You are building with a designer, not a developer.** The founder has strong visual instincts and zero tolerance for ugly or generic UI. When in doubt, ask about design intent before writing styling code.

A full set of approved screen designs (screenshots + specs) has been provided in the design handoff document. Refer to it for every screen before writing any UI code.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React Native + Expo | SDK 52+ |
| Navigation | Expo Router | v4 |
| Language | TypeScript | strict mode |
| Styling | StyleSheet API (no Tailwind) | — |
| Backend | Supabase | latest |
| Payments | RevenueCat | latest |
| Local DB | Expo SQLite | latest |
| AI | Anthropic Claude API | claude-sonnet-4-6 |
| Analytics | Mixpanel + Amplitude | — |
| Error tracking | Sentry | — |
| State | Zustand (global) + React Query (server) | — |

---

## Critical Security Rules

> Violating these will cause app rejection or security incidents. Never skip them.

1. **`ANTHROPIC_API_KEY` must never appear in client-side code or the app bundle.** All Claude API calls go through Supabase Edge Functions in `/supabase/functions/`. If asked to call the Claude API from a component or hook, refuse and scaffold an Edge Function instead.

2. **All Supabase tables use Row Level Security.** Every migration file must include RLS policies. Never create a table without them. Default policy: `auth.uid() = user_id`.

3. **`SUPABASE_SERVICE_ROLE_KEY` is server-side only** — scripts and Edge Functions only. Never reference it in Expo code.

4. **Environment variables prefixed `EXPO_PUBLIC_` are bundled into the app** and visible to users. Only non-sensitive values go there (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `REVENUECAT_*` keys).

5. **Never store plaintext API keys in code, comments, or commit messages.**

---

## Code Style

### TypeScript
- Strict mode is on. No `any` types. If you don't know the type, ask.
- All props interfaces use `type`, not `interface` (consistency).
- Prefer explicit return types on all functions.
- Use `const` assertions for constant objects.

```typescript
// ✅ correct
type MantraCardProps = {
  mantra: Mantra;
  onHeart: (mantraId: string) => void;
};

// ❌ wrong
interface MantraCardProps {
  mantra: any;
}
```

### React Native
- Use `StyleSheet.create()` for all styles — no inline style objects (except dynamic values).
- All touch targets minimum 44×44pt (accessibility requirement).
- Use `Pressable` not `TouchableOpacity`.
- Animate with `react-native-reanimated` not the built-in `Animated` API.
- All images use `expo-image` not the built-in `Image`.

```typescript
// ✅ correct
<Pressable onPress={handleHeart} hitSlop={8}>

// ❌ wrong
<TouchableOpacity onPress={handleHeart}>
```

### File naming
```
components/  → PascalCase.tsx          (MantraCard.tsx)
screens/     → kebab-case.tsx          (gate.tsx, liked.tsx)
hooks/       → camelCase, use prefix   (useMantras.ts)
lib/         → camelCase               (supabase.ts, claude.ts)
types/       → PascalCase              (Mantra.ts)
constants/   → UPPER_SNAKE.ts          (CATEGORIES.ts)
```

### Import order (enforced by ESLint)
```typescript
// 1. React / React Native
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 2. Expo packages
import { router } from 'expo-router';
import * as SQLite from 'expo-sqlite';

// 3. Third-party
import Animated from 'react-native-reanimated';

// 4. Internal — lib
import { supabase } from '@/lib/supabase';

// 5. Internal — components
import { MantraCard } from '@/components/MantraCard';

// 6. Internal — hooks
import { useMantras } from '@/hooks/useMantras';

// 7. Types
import type { Mantra } from '@/types/Mantra';
```

---

## Design System

> The founder is a designer. Maintain these values exactly. All values below are locked — do not substitute or approximate.

### Brand Colours
```typescript
export const colors = {
  // Backgrounds
  bgGradientTop:    '#4A2875',   // gradient start
  bgGradientMid:    '#321650',   // gradient middle
  bgGradientBottom: '#2A1228',   // gradient end
  // Usage: linear-gradient(170deg, #4A2875 0%, #321650 50%, #2A1228 100%)

  // Text
  textPrimary:   '#F3EEFF',   // headings, mantra text
  textSecondary: '#D8B4FE',   // labels, secondary copy
  textMuted:     '#C4A8E0',   // body text, sublabels

  // Accent
  teal:          '#7EC8C0',   // primary action colour, active states, icons
  tealDark:      '#0D2E2B',   // text on teal buttons

  // Surfaces
  cardBg:        'rgba(255,255,255,0.05)',
  cardBorder:    'rgba(216,180,254,0.15)',
  cardBorderSub: 'rgba(216,180,254,0.12)',

  // Semantic
  error:         '#EF4444',
  success:       '#22C55E',
} as const;
```

### Typography
```typescript
export const typography = {
  // Mantra font — Cormorant Garamond, italic
  // Use for: mantra text, screen titles, headlines
  mantraFamily: 'Cormorant Garamond',
  mantraStyle:  'italic' as const,
  mantraColor:  '#F3EEFF',

  // UI font — Inter
  // Use for: labels, body, buttons, meta
  uiFamily: 'Inter',

  // Sizes
  xs:    10,
  sm:    11,
  base:  12,
  md:    13,
  lg:    15,
  xl:    18,
  '2xl': 22,
  '3xl': 26,
  '4xl': 30,
  '5xl': 34,
  '6xl': 38,

  // Weights
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
} as const;
```

### Spacing (8pt grid)
```typescript
export const spacing = {
  1:  4,
  2:  8,
  3:  12,
  4:  16,
  5:  20,
  6:  24,
  7:  28,
  8:  32,
  10: 40,
  11: 44,
  12: 48,
  16: 64,
} as const;
```

### Border radius
```typescript
export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  pill: 999,   // all buttons use pill
} as const;
```

### Button entrance animation (all primary buttons)
```typescript
// Scale 0.82 → 1.0, opacity 0 → 1
// Duration: 0.9s
// Easing: cubic-bezier(0.16, 1, 0.3, 1)
// Choice split buttons: 1.1s same curve
```

---

## Screen Inventory

All 16 approved screens. Refer to the design handoff doc for screenshots and full specs before building any of these.

### Onboarding flow (unauthenticated)
| Route | Screen | Step |
|-------|--------|------|
| `/` | Splash | — |
| `/(auth)/welcome` | Welcome | — |
| `/(auth)/goals` | Goal Selection | 1 of 5 |
| `/(auth)/apps` | App Picker | 2 of 5 |
| `/(auth)/demo` | Gate Demo | 3 of 5 |
| `/(auth)/permissions` | Permissions Guide | 4 of 5 |
| `/(auth)/paywall` | Paywall | 5 of 5 |

### Core app (authenticated)
| Route | Screen |
|-------|--------|
| `/(tabs)/` | Home |
| `/(tabs)/library` | Library |
| `/(tabs)/journal` | Journal |
| `/(tabs)/settings` | Settings |
| `/master-mantra` | Master Mantra |
| `/paused` | App Paused |

### Tab bar (4 items)
Home · Library · Journal · Settings
Active: `#7EC8C0` icon + label. Inactive: `#C4A8E0`.

---

## The Gate Screen

The gate screen is the most important screen in the app — it's the core product moment. Read PRD.md Sections 5.4 (iOS) and 5.5 (Android) before writing any native code.

**Key behaviours:**
- Mantra text: Cormorant Garamond italic 27px `#F3EEFF`, centred, line-height 1.55
- Heart button: always visible top-right, never hidden or disabled. Fills `#7EC8C0` on tap.
- Three-tap chant sequence — same button position, label evolves:
  - Step 0: *"I said this once"* — `#7EC8C0`
  - Step 1: *"I said this again"* — `#6DB8B0`
  - Step 2: *"I said this three times"* — `#5CA8A0`
- After third tap — choice split: *"Keep it locked"* (ghost pill) + *"Open for 1 hour"* (solid teal)
- Close button: ghost pill, hidden when choice appears
- Pulse rings: teal `rgba(126,200,192,0.12)` and `0.07`, 5s breathe cycle
- Background: gradient, stars (hand-drawn PNGs from `/assets/stars/`, parallax drift, 3 depth layers)
- Never show loading states — always show something (fallback to cached mantra)

**"I read this" button delay:** Global setting stored in `user_settings.gate_delay_seconds`. Options: 0, 3, 5, 10 seconds. Default: 3s. This is the minimum time before the chant button becomes active. Applied equally to all gated apps — there is no per-app delay setting.

**iOS v1.0 — Notification-based gate (build this — no entitlement required):**
- Gate is triggered via `UNUserNotificationCenter` when user opens a gated app
- Request notification permission during onboarding (before gate demo)
- Prominent banner with CTA: *"Pause before you scroll →"* opens Pause Mantra gate screen
- User completes chant → taps "Open for 1 hour" → guided back to original app
- Does not physically block the app — motivated users can bypass
- App picker in onboarding uses custom UI only (no `FamilyActivityPicker` needed in v1.0)
- On permissions screen: replace Screen Time steps with notification permission steps

**iOS v1.1 — FamilyControls (upgrade path — apply for entitlement in parallel, non-blocking):**
- `com.apple.developer.family-controls` entitlement required — apply now, approval 2–5 days
- Once approved: `ManagedSettings` → `ApplicationToken` restrictions → `ShieldConfigurationDataSource`
- App picker triggers `FamilyActivityPicker` system sheet after custom pre-selection
- Fully blocks the app — no bypass possible
- Feature-flag the upgrade via Posthog — roll out silently when tested

> Build v1.0 now. Do not wait for the entitlement. Upgrade to v1.1 when approved.

---

## The Gate Demo Screen (Onboarding)

Route: `/(auth)/demo` — Step 3 of 5.

This is an identical copy of the gate screen with a guided tooltip overlay. **Build it as a completely separate component** — do not reuse the production gate screen with props. Demo state must never couple with production gate logic.

Demo mantra (hardcoded): *"Possibility always collapses in my favor."*

Seven tooltip steps guide the user through the experience. The heart tap at step 3 must be a real interaction — the user taps the actual heart icon to advance, not the tooltip button.

---

## Subscription Model

### Two-tier paid model — NO free tier

| | Base | Pro |
|---|---|---|
| Gate mechanic — unlimited apps | ✓ | ✓ |
| Full 10,000+ mantra library | ✓ | ✓ |
| Heart button + Liked Mantras gallery | ✓ | ✓ |
| Gate log & reflection notes | ✓ | ✓ |
| Streak — this month & last month | ✓ | ✓ |
| Master Mantra AI synthesis | ✗ | ✓ |
| Full streak history — all time | ✗ | ✓ |
| Reflection prompts on gate screen | ✗ | ✓ |

**Trial:** 7-day full Pro access trial.
- iOS: no credit card required. Apple handles natively — configure in App Store Connect.
- Android: payment method required on file, not charged until day 7.
- Trial is always of the **Pro tier** regardless of which plan the user selects at the end.

**After trial:** User is automatically charged for the plan they selected during onboarding. The App Paused screen (`/paused`) only appears if the user has **actively cancelled** their subscription — not on trial expiry.

### RevenueCat product IDs

```typescript
// lib/revenuecat.ts
import Purchases from 'react-native-purchases';

export const PRODUCTS = {
  // Base tier
  BASE_MONTHLY:  'pausemantra_base_monthly',    // $4.99/mo
  BASE_ANNUAL:   'pausemantra_base_annual',     // $39/yr

  // Pro tier
  PRO_MONTHLY:   'pausemantra_pro_monthly',     // $7.99/mo
  PRO_ANNUAL:    'pausemantra_pro_annual',      // $59/yr
  PRO_LIFETIME:  'pausemantra_pro_lifetime',    // $89 one-time
} as const;

// Entitlement IDs
export const BASE_ENTITLEMENT = 'base';
export const PRO_ENTITLEMENT  = 'pro';
// Pro is a superset — Pro users also get all Base features
```

### Entitlement checks

```typescript
const { entitlements } = await Purchases.getCustomerInfo();
const isPro  = entitlements.active[PRO_ENTITLEMENT]  !== undefined;
const isBase = entitlements.active[BASE_ENTITLEMENT] !== undefined || isPro;
// Always use isBase for Base features, isPro for Pro features
```

### Paywall
- Hard paywall — no skip button, no free tier
- Pro pre-selected by default (trial is Pro)
- Base and Pro tiers shown via toggle at top of paywall screen
- Route: `/(auth)/paywall` in onboarding, also rendered as modal sheet from Settings → Subscription → Manage

---

## Database Schema

### Core tables (all require RLS)

```sql
-- User settings
create table public.user_settings (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references auth.users not null unique,
  gate_delay_seconds       int default 3,           -- 0, 3, 5, or 10
  reflection_prompts_enabled boolean default false,
  master_mantra_active     boolean default false,
  gate_mantra_id           uuid references public.master_mantras,
  subscription_status      text default 'trial',    -- 'trial' | 'active' | 'paused'
  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

-- Gated apps
create table public.user_gated_apps (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  app_name     text not null,
  bundle_id    text,          -- iOS
  package_name text,          -- Android
  created_at   timestamptz default now()
);

-- Gate events
create table public.gate_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  app_name    text not null,
  mantra_id   uuid references public.mantras,
  outcome     text not null,  -- 'entered' | 'closed'
  created_at  timestamptz default now()
);

-- Gate notes (reflection journal)
create table public.gate_notes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users not null,
  gate_event_id  uuid references public.gate_events not null,
  note_text      text not null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- Liked mantras
create table public.liked_mantras (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  mantra_id  uuid references public.mantras not null,
  created_at timestamptz default now(),
  unique(user_id, mantra_id)
);

-- Master mantras (AI synthesised)
create table public.master_mantras (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users not null,
  mantra_text  text not null,
  liked_count  int not null,
  created_at   timestamptz default now()
);

-- User goals (onboarding)
create table public.user_goals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users not null,
  goal       text not null,
  created_at timestamptz default now()
);
```

**RLS template for all tables:**
```sql
alter table public.X enable row level security;
create policy "Users manage own X" on public.X
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

**Required indexes:**
```sql
create index on public.gate_events (user_id, created_at desc);
create index on public.gate_notes (gate_event_id);
create index on public.liked_mantras (user_id);
create index on public.master_mantras (user_id, created_at desc);
```

---

## Supabase Patterns

### Client setup
```typescript
// lib/supabase.ts — always import from here, never instantiate elsewhere
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const supabase = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
);
```

### Query patterns
```typescript
// ✅ Always type your queries using the generated Database type
const { data, error } = await supabase
  .from('mantras')
  .select('id, text, category')
  .eq('active', true)
  .limit(1);

// ✅ Always handle errors
if (error) throw new Error(`Mantra fetch failed: ${error.message}`);

// ❌ Never ignore errors
const { data } = await supabase.from('mantras').select('*');
```

### Migrations
- Every migration file lives in `/supabase/migrations/`
- Filename format: `YYYYMMDDHHMMSS_description.sql`
- Every new table must include:
  1. RLS enabled: `alter table public.X enable row level security;`
  2. At minimum a select policy for the owning user
  3. Indexes on `user_id` and `created_at` for all event tables

### Edge Functions
- Live in `/supabase/functions/`
- Use Deno runtime (TypeScript)
- Import Anthropic SDK: `import Anthropic from 'npm:@anthropic-ai/sdk';`
- Always validate the calling user's JWT before processing
- Return consistent `{ data, error }` shape

**Required Edge Functions:**
- `synthesise-master-mantra` — takes `user_id`, fetches top 10 most recently liked mantras, calls Claude API to synthesise into one personal mantra, stores result in `master_mantras` table
- `export-user-data` — GDPR/CCPA compliance, generates JSON of all user data and emails it or downloads it to device

---

## Local SQLite (Offline Cache)

```typescript
// lib/sqlite.ts — all SQLite operations go through this module
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('pausemantra.db');

// Tables: mantras_cache, seen_mantras_local
// mantras_cache is pre-populated at app install from bundled JSON
// seen_mantras_local syncs to Supabase when online
```

The bundled mantra database lives at `/assets/mantras.db` and is generated by `/scripts/generate-mantras.js`. Never hard-code mantras in component files.

---

## App Permissions (Platform-specific)

### iOS — v1.0 Notification-based gate (build this — no entitlement required)
- Gate triggers via `UNUserNotificationCenter` when user opens a gated app
- Request notification permission during onboarding (before gate demo screen)
- Prominent banner CTA opens Pause Mantra to gate screen; user completes chant; guided back to original app
- App picker: custom UI only — no `FamilyActivityPicker` in v1.0
- Permissions guide screen shows notification permission steps, not Screen Time steps
- Does not physically block the app — motivated users can bypass; acceptable for v1.0

### iOS — v1.1 Screen Time / FamilyControls (apply in background — non-blocking)
- Apply for `com.apple.developer.family-controls` entitlement in background; approval 2–5 days
- Do not block v1.0 build on this — upgrade silently when approved
- Once approved: `ManagedSettings` → `ApplicationToken` restrictions → `ShieldConfigurationDataSource`
- App picker migrates to trigger `FamilyActivityPicker` after custom pre-selection
- `AuthorizationCenter.shared.requestAuthorization()` on return from Settings
- Deep link to Screen Time: `Linking.openURL('App-Prefs:SCREEN_TIME')`
- Feature-flag the v1.1 upgrade via Posthog — gradual rollout when tested

### Android — Accessibility + Usage Stats
- `AccessibilityService` — monitors app launches, triggers gate overlay
- `UsageStatsManager` — detects which app is being opened
- Battery optimisation must be disabled for reliable background operation
- Deep link to settings: `Linking.openSettings()`
- User taps "I've done it" → verify both permissions granted via native module before advancing

### Permissions guide screen
- Auto-detect platform with `Platform.OS` — show only relevant steps
- All steps visible simultaneously — user reads then taps "Open Settings →"
- **iOS v1.0:** Shows notification permission steps (not Screen Time); "Open Settings →" links to notification settings; auto-return detection via `AppState`
- **iOS v1.1:** Will switch to Screen Time steps after FamilyControls entitlement approved
- **Android:** Shows Accessibility + Usage Stats steps; manual "I've done it ✓" confirmation

---

## Mantra Categories (15)

Abundance · Self-Love · Confidence · Health · Gratitude · Focus · Connection · Success · Peace · Creativity · Vitality · Courage · Purpose · Manifestation · Clarity

These are the only valid category values. Use `CATEGORIES` constant — never hardcode strings.

---

## Key Copy (Locked)

These strings are approved by the founder. Do not change them without explicit instruction.

| Context | Copy |
|---|---|
| Gate demo mantra | *"Possibility always collapses in my favor."* |
| App paused headline | *"Abundance is waiting for you."* |
| App paused body | *"Whenever you're ready to come back, your practice picks up right where you left off."* |
| App paused CTA | *"Come back"* |
| Paywall headline | *"Transform doom-scrolling into a life-giving ritual."* |
| Paywall CTA | *"Start 7-day free trial"* |
| Welcome headline | *"Every time you reach for your phone, reach inward first."* |
| Permissions headline | *"One quick setup."* |
| Permissions subtitle | *"We'll open Settings for you. Follow these steps, then come straight back."* |
| Splash tagline | *"mindful by design"* |

---

## Journal — Reflection Notes

Reflection notes are a **Base** feature (available to all subscribers).

- Notes are stored in the `gate_notes` table with a `gate_event_id` foreign key
- In the journal log, each gate row has an edit pencil icon (SVG 13px `rgba(196,168,224,0.4)`)
- Tapping opens a modal sheet — same slide-up animation as all other modals (`0.4s cubic-bezier(0.16,1,0.3,1)`)
- Textarea: Cormorant Garamond 15px italic `#F3EEFF`, placeholder *"How did that feel?"*, focus border `rgba(126,200,192,0.5)`
- Save button: full width pill `#7EC8C0`, Inter 14px weight 500, *"Save reflection"*
- On save: upsert to `gate_notes`

**Reflection prompts on gate screen (Pro only):**
- Controlled by `user_settings.reflection_prompts_enabled` (default: `false`)
- Toggled in Settings → Gate Behaviour → Reflection prompts
- When enabled: after gate choice (enter or close), a soft prompt fades in with single-line input
- Placeholder: *"A thought before you go..."*, Skip link right-aligned
- Auto-dismisses after 3 seconds if untouched

---

## Library Screen

Three tabs — Featured, Liked, Master — toggle a single card at the top. Categories grid below is always visible.

**Featured tab:** Random mantra from SQLite cache. Refresh button cycles to next. Heart saves to `liked_mantras`.

**Liked tab:** All hearted mantras from `liked_mantras` table, ordered by `created_at` desc. Available to all subscribers (Base and Pro).

**Master tab (Pro only):**
- Unlocked when `liked_mantras` count ≥ 5
- Locked state: progress bar showing `likedCount / 5`, copy *"Heart 5 mantras to unlock"*
- Unlocked state: synthesised mantra + Regenerate button + Set as gate button
- Regenerate calls `synthesise-master-mantra` Edge Function

**Category chips:** Tap to open category modal sheet. Modal shows mantras from that category, paginated (limit 20, load more). Each mantra has a heart button. Data from SQLite cache filtered by category.

---

## Settings Screen

Three sections: Gated Apps, Gate Behaviour, Account.

**Gated Apps:**
- List of gated apps — app icon + name only (no per-app category or delay)
- Remove button per app (red pill)
- "Add an app" dashed border button
- On iOS: opens `FamilyActivityPicker` system sheet
- On Android: opens custom installed app list using `UsageStatsManager`

**Gate Behaviour:**
- *"'I read this' button delay"* — global delay picker: 0s, 3s, 5s, 10s. Stored in `user_settings.gate_delay_seconds`.
- Reflection prompts toggle (Pro only) — stored in `user_settings.reflection_prompts_enabled`

**Account:**
- Subscription row — shows current plan + renewal date + "Manage" pill (opens RevenueCat management flow)
- Privacy policy → external link
- Export my data → calls `export-user-data` Edge Function (GDPR/CCPA compliance — legally required)
- Delete account → confirmation dialog → deletes all user rows + Supabase auth record

---

## Streak Logic

- **Base:** Current streak, best streak, streak for current month and previous month only
- **Pro:** Full all-time streak history and calendar heatmap
- Streak calendar: three cell states — empty `rgba(255,255,255,0.05)`, active 1–4 gates `rgba(126,200,192,0.25)`, high 5+ gates `#7EC8C0`
- Today cell: always add `1px solid #7EC8C0` border regardless of activity
- Data source: `gate_events` grouped by date, `outcome = 'entered'` only counts toward streak

---

## Splash Screen

- Native splash (`expo-splash-screen`): `#321650` background + lock icon centred — matches JS splash exactly to prevent flash
- JS splash animation sequence:
  1. Rings fade in (200ms delay, 1200ms)
  2. Lock icon scales in (400ms delay, 700ms, `cubic-bezier(0.16,1,0.3,1)`)
  3. Wordmark rises up (750ms delay, 700ms)
  4. Tagline fades in (1050ms delay, 600ms)
- After animation (~1.8s): check auth state → route to welcome, home, or paused

---

## Feature Flag Checks

Use Posthog for all A/B tests and feature flags:
```typescript
import PostHog from 'posthog-react-native';
const showHardPaywall = await posthog.isFeatureEnabled('hard_paywall_v2');
```

---

## Testing

- Unit tests: Jest + React Native Testing Library
- Test files: `__tests__/` directory next to the file being tested, or `ComponentName.test.tsx`
- Required test coverage for:
  - All Supabase query helpers in `lib/`
  - Gate logic (GATE-01 to GATE-05)
  - Mantra deduplication logic (MNTR-03)
  - RevenueCat entitlement checks (both BASE and PRO)
  - Reflection note upsert logic
- Do not write tests for styling or pure presentational components unless asked

---

## Git Conventions

```
feat(GATE-01): implement iOS Screen Time gate intercept
fix(MNTR-03): correct dedup logic for seen_mantras rollover
chore: run generate-mantras script for Abundance category
test(PAY-01): add RevenueCat webhook handler tests
```

Commit message format: `type(FEATURE-ID): description`
Types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`

Branch naming: `feat/GATE-01-ios-screen-time`, `fix/MNTR-03-dedup`

---

## How to Work With Me (Claude Code Instructions)

### When I give you a feature ID (e.g. "implement HEART-01")
1. Read the relevant section in `PRD.md` first
2. Check what existing code is in place before scaffolding anything new
3. Ask if the relevant Supabase migration already exists before writing one
4. Implement the feature, write a test, and summarise what you did

### When I ask you to create a new screen
1. Use the route from the Screen Inventory above
2. Read the corresponding spec in the design handoff document before writing any code
3. Follow the file naming conventions above
4. Use colours and spacing from the design system — never arbitrary hex values
5. Stub any data with `// TODO: replace with real Supabase query`

### When I ask you to create a Supabase migration
1. Check `/supabase/migrations/` for existing tables first
2. Use the schema defined in this file as the source of truth
3. Always include RLS policies
4. Name the file with a timestamp prefix

### When I ask about the gate mechanism
Read PRD.md Section 6.4 (iOS) and 6.5 (Android) before writing any native code. **iOS v1.0 uses notification-based gating — do not attempt to scaffold FamilyControls or Screen Time API code until the entitlement is confirmed approved.** Android uses the full Accessibility Service overlay — build that without restriction.

### When something in the PRD conflicts with what I ask you
Flag it explicitly: "This conflicts with [PRD section] which says [X]. Which should I follow?" Never silently implement something that contradicts the PRD.

### Things you should never do without asking
- Change the database schema (add/remove columns, rename tables)
- Modify the RevenueCat product IDs or entitlement names
- Change the navigation structure (routes, tab bar items)
- Add a new third-party dependency
- Expose `ANTHROPIC_API_KEY` in client-side code (hard no)
- Change any locked copy strings listed in this file

---

## Common Commands

```bash
# Start dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android

# Generate Supabase types after schema changes
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts

# Run migrations
npx supabase db push

# Build for TestFlight
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest

# Build for Play Store
eas build --platform android --profile production

# Run mantra pre-generation script
node scripts/generate-mantras.js --category Abundance --count 500

# Run tests
npx jest --watchAll=false
```

---

## Project Status

See `PRD.md` Section 8 (Launch Milestones) for current milestone and what's in scope.

Current milestone: **M0 — Setup**
Next milestone: **M1 — Alpha** (Gate mechanism + onboarding + 100 seed mantras)

Build screens in the order defined in PRD.md Section 7. For iOS gate mechanism, build the v1.0 notification-based approach — do not scaffold FamilyControls code until the entitlement is confirmed approved.

---

*Last updated: March 2026*
