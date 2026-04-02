# Pause Mantra — Product Requirements Document
**Version:** 1.1 | **Status:** Active | **Date:** March 2026

> Mindful app-gating for the manifestation generation. Pause Mantra intercepts every launch of a designated app with a curated mantra, transforming a mindless reflex into an intentional choice.

---

## Table of Contents
1. [Product Overview](#1-product-overview)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas](#3-user-personas)
4. [Subscription Model](#4-subscription-model)
5. [Feature Requirements](#5-feature-requirements)
6. [Technical Architecture](#6-technical-architecture)
7. [Screen Inventory](#7-screen-inventory)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Launch Milestones](#9-launch-milestones)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Open Questions](#11-open-questions)

---

## 1. Product Overview

### Vision
Pause Mantra is the first app-gating platform built for the mindfulness and manifestation community. Instead of hard-blocking apps or imposing guilt, Pause Mantra gates every launch of a designated app behind a curated mantra or affirmation — turning a mindless reflex into an intentional choice.

### Problem
Existing tools (Freedom, Opal, ScreenZen, One Sec) use productivity/willpower framing. None speak to the 58M+ monthly active social media users who identify as manifestors, wellness seekers, or spiritual consumers. PrayerLock proved the model works for religion. Pause Mantra fills the secular spiritual gap.

### Positioning
| Field | Value |
|-------|-------|
| App name | Pause Mantra |
| Bundle ID | com.pausemantra.app |
| Domains | pausemantra.com / pausemantra.app |
| Category | Mobile app (iOS + Android) + Claude AI |
| Target user | 18–35 wellness-focused social media users; manifestation practitioners |
| Core value prop | Every time you open a distracting app, you pause and absorb a mantra first |
| Monetisation | No free tier — 7-day full Pro trial → Base ($4.99/mo or $39/yr) or Pro ($7.99/mo or $59/yr) or Lifetime Pro ($89) |
| Platform | iOS 16+ and Android 13+ via React Native (Expo) |

---

## 2. Goals & Success Metrics

### Business Goals
- 10,000 active users within 90 days of launch
- 4,200 paid subscribers (break-even) within 18 months
- Maintain 4.5+ App Store rating from launch
- $350K ARR by end of Year 2

### Product Goals
- Reduce impulsive app opens by 40% for active users
- 60%+ Day-7 retention (vs 27% industry average for wellness apps)
- 3+ mantra completions per user per day
- <2s gate display latency on all target devices

### KPIs
| Metric | Target 90 days | Target 12 months | Tool |
|--------|---------------|-----------------|------|
| DAU/MAU ratio | >25% | >35% | Mixpanel |
| Gate completion rate | >70% | >80% | Custom events |
| Paid conversion rate | >4% | >7% | RevenueCat |
| D7 retention | >50% | >60% | Amplitude |
| App Store rating | >4.3 | >4.5 | App Store Connect |

---

## 3. User Personas

### 3.1 Primary — "The Conscious Manifestor"
- **Age/Gender:** 24–34, skews female (72%)
- **Platforms:** TikTok, Instagram, Pinterest
- **Mindset:** Practices law of attraction; uses affirmation apps; follows @thatgirl content
- **Pain point:** Knows social drains her energy but hard-blockers feel too restrictive
- **Goal:** Turn every phone pick-up into a reinforcement of her manifestation practice
- **WTP:** High — already pays for Headspace, I Am, or Calm

### 3.2 Secondary — "The Wellness Explorer"
- **Age/Gender:** 28–42, mixed gender
- **Platforms:** Instagram, LinkedIn, YouTube
- **Mindset:** Interested in mindfulness but not deeply spiritual; productivity-aware
- **Pain point:** Scrolls too much but doesn't want an app that shames him
- **Goal:** A gentle pause that feels empowering, not punishing
- **WTP:** Medium — converts on annual discount

---

## 4. Subscription Model

### No free tier
All users start with a 7-day full Pro trial, then convert to a paid plan. The trial is always of the **Pro tier** regardless of which plan the user selects at the end. After trial expires, the user is automatically charged for the plan they selected during onboarding. The App Paused screen (`/paused`) only shows if the user **actively cancels** their subscription — it is not shown on trial expiry.

- **iOS:** No credit card required. Apple handles natively — configure 7-day free trial in App Store Connect.
- **Android:** Payment method required on file, not charged until day 7.

### Two-tier model

| Feature | Base | Pro |
|---------|------|-----|
| Gate mechanic on unlimited apps | ✓ | ✓ |
| Full 10,000+ mantra library | ✓ | ✓ |
| Heart button + Liked Mantras gallery | ✓ | ✓ |
| Gate log & reflection notes | ✓ | ✓ |
| Streak — this month & last month | ✓ | ✓ |
| Master Mantra AI synthesis | — | ✓ |
| Full streak history — all time | — | ✓ |
| Reflection prompts on gate screen | — | ✓ |

### Pricing & RevenueCat product IDs

| Plan | Price | Product ID |
|------|-------|-----------|
| Base Monthly | $4.99/mo | `pausemantra_base_monthly` |
| Base Annual | $39/yr ($3.25/mo) | `pausemantra_base_annual` |
| Pro Monthly | $7.99/mo | `pausemantra_pro_monthly` |
| Pro Annual | $59/yr ($4.92/mo) | `pausemantra_pro_annual` |
| Pro Lifetime | $89 one-time | `pausemantra_pro_lifetime` |

**RevenueCat entitlement IDs:**
- `base` — Base features
- `pro` — Pro features (superset of Base; Pro users also get all Base features)

**Entitlement check pattern:**
```typescript
const { entitlements } = await Purchases.getCustomerInfo();
const isPro  = entitlements.active['pro']  !== undefined;
const isBase = entitlements.active['base'] !== undefined || isPro;
```

> Apply for Apple Small Business Program before launch — reduces Apple cut from 30% to 15% on first $1M revenue.

---

## 5. Feature Requirements

**Priority levels:** P0 = must ship for launch | P1 = should ship | P2 = nice to have

---

### 5.1 Core Gate Mechanism (P0)

| ID | Priority | Description | Acceptance Criteria | Notes |
|----|----------|-------------|---------------------|-------|
| GATE-01 | P0 | Intercept target app launches and display gate screen before allowing entry | Gate appears <2s after app tap; Android: no app opens without gate interaction; iOS v1.0: gate prompt appears via notification/overlay approach | **iOS v1.0:** Notification + App Group overlay (no entitlement required). **iOS v1.1:** Screen Time API (FamilyControls) once entitlement approved. **Android:** UsageStatsManager + Accessibility Service overlay — full block. |
| GATE-02 | P0 | Three-tap chant sequence — user taps "I said this once / again / three times" to pass the gate | App does not open until all three chants complete; button label and colour evolve each tap | Core ritual mechanic; not dismissable until three taps |
| GATE-03 | P0 | User can choose to close app instead of entering | Close button always visible; hidden when choice split appears after third chant | Track close rate as key metric |
| GATE-04 | P0 | Gate works for user-selected apps only | Non-selected apps open normally | Min 1, max unlimited |
| GATE-05 | P0 | "I read this" button delay — global timer (0s, 3s, 5s, 10s) before chant button activates | Timer applies equally to ALL gated apps — no per-app delay; default 3s | Stored in `user_settings.gate_delay_seconds` |

**Gate screen chant sequence:**
- Step 0 button: "I said this once" — `#7EC8C0`
- Step 1 button: "I said this again" — `#6DB8B0`
- Step 2 button: "I said this three times" — `#5CA8A0`
- After third tap: choice split — "Keep it locked" (ghost pill) + "Open for 1 hour" (solid teal)
- Close button hides when choice split appears
- Heart button: always visible top-right, never disabled, fills `#7EC8C0` on tap

---

### 5.2 Mantra & Content System (P0)

| ID | Priority | Description | Acceptance Criteria | Notes |
|----|----------|-------------|---------------------|-------|
| MNTR-01 | P0 | Pre-generated offline library of 10,000+ affirmations across 15 categories, shipped in the app bundle | All affirmations load with zero network; app works if API is down | Batch-generate via Claude API before launch; store in Expo SQLite + Supabase |
| MNTR-02 | P0 | User selects mantra categories during onboarding (multi-select) | Category selection persists; mantras served from chosen categories | Saved to `user_goals` table |
| MNTR-03 | P0 | Lifetime deduplication — never show the same mantra twice unless user explicitly requests it | `seen_mantras` tracks every mantra shown; pull from unseen pool first; when pool exhausted prompt "Start fresh?" | Local SQLite first; sync to Supabase for Pro |
| MNTR-04 | P1 | User can write and save custom mantras | Custom mantras appear in rotation; 280 char limit | Pro feature; deferred to v1.x |
| MNTR-05 | P2 | AI-generated personalised mantras via Claude API | User inputs goals; Claude returns 10 personalised affirmations | claude-sonnet-4-6; Pro feature; deferred to v1.x |

**15 Mantra Categories:** Abundance · Self-Love · Confidence · Health · Gratitude · Focus · Connection · Success · Peace · Creativity · Vitality · Courage · Purpose · Manifestation · Clarity

> Note: Per-app mantra category assignment (original MNTR-05) is deferred to v1.x. In v1.0, mantra categories are global — the same category pool applies to all gated apps.

---

### 5.3 Heart & Liked Mantras System (P1)

> Powers the Master Mantra feature. Hearts transform passive consumption into active collection. All subscribers can heart and view liked mantras.

| ID | Priority | Description | Acceptance Criteria | Notes |
|----|----------|-------------|---------------------|-------|
| HEART-01 | P1 | Heart button visible on every gate screen — one tap saves mantra to liked list | Heart icon always visible on gate; tap triggers fill animation; `liked_mantras` row created <200ms | All subscribers |
| HEART-02 | P1 | Liked Mantras tab in Library — scrollable list of all hearted mantras | Accessible from Library → Liked tab; shows mantra text, category, date hearted | All subscribers |
| HEART-03 | P1 | "Show again" toggle — mark any mantra to re-enter seen rotation | Toggle on each mantra in liked list; overrides MNTR-03 dedup logic | All subscribers |
| HEART-04 | P1 | Un-heart option — remove mantra from liked list | Long press or swipe-left reveals remove; soft delete recoverable 7 days | All subscribers |
| HEART-05 | P2 | Liked list shareable as aesthetic image | Share sheet generates branded image of top 5–10 liked mantras | Pro feature; deferred to v1.x |

---

### 5.4 Master Mantra Synthesis (P1 — Pro)

> Signature Pro feature. Claude synthesises the user's hearted mantras into one deeply personal master affirmation. Ceremonial word-by-word reveal on generation.

| ID | Priority | Description | Acceptance Criteria | Notes |
|----|----------|-------------|---------------------|-------|
| MSTR-01 | P1 | Master Mantra tab in Library — locked until user has hearted 5+ mantras | Progress bar in locked state shows `likedCount / 5`; unlocked when count ≥5 | Pro feature; claude-sonnet-4-6 |
| MSTR-02 | P1 | Claude synthesises hearted mantras into one personalised master affirmation (1–3 sentences) | Sends top 10 recently liked mantra texts to Claude; returns single affirmation in present tense, positive framing | System prompt enforces "I am" structure, no negations, no future tense |
| MSTR-03 | P1 | Master Mantra can be set as permanent gate mantra | "Set as gate mantra" toggle; overrides normal rotation while active | `master_mantras` table; one active at a time |
| MSTR-04 | P1 | Re-synthesise — generate new Master Mantra as liked library grows | Regenerate button always available; each synthesis creates new version; history of past masters saved | Debounce to prevent spam; 1 API call per generation |
| MSTR-05 | P1 | Ceremonial word-by-word reveal animation on synthesis | 2.2s "Synthesising your words" generating state → words fade in one at a time (180ms between) | Core premium moment |
| MSTR-06 | P1 | Previous versions accordion | Past master mantras collapsible below current; chevron toggle | Shows mantra text + date + liked count at time of synthesis |
| MSTR-07 | P2 | Master Mantra shareable as premium visual card | One-tap share as branded image | Deferred to v1.x |
| MSTR-08 | P2 | Audio version of Master Mantra via TTS | Playable on gate screen; 3 voice options | Expo Speech or ElevenLabs; deferred to v1.x |

**Claude API prompt spec for MSTR-02:**
```
System: You are a manifestation coach. Given a list of affirmations a user has saved,
synthesise them into a single master mantra of 1-3 sentences.
Rules: present tense only, positive framing only, start with "I am" or "I have" or "I attract",
no negations, no future tense ("I will"), no conditional ("I can").
Return only the mantra text, no preamble.

User: Here are my saved mantras: [array of mantra texts]
```

---

### 5.5 Reflection Notes

| ID | Priority | Description | Acceptance Criteria | Notes |
|----|----------|-------------|---------------------|-------|
| JRNL-04 | P1 | Optional reflection note on any gate event — editable from journal log | Pencil icon on each gate row in journal; modal sheet slides up; note saved to `gate_notes` table | **Base feature** — all subscribers |
| JRNL-05 | P1 | Reflection prompts on gate screen — optional prompt that appears after each gate choice | Toggled in Settings → Gate Behaviour (default off); prompt fades in after enter/close choice; auto-dismisses after 3s if untouched; saves to `gate_notes` | **Pro feature** — stored in `user_settings.reflection_prompts_enabled` |

---

### 5.6 Offline-First Content Architecture (P0)

> The Claude API is an enhancement layer, never a dependency. The core gate always works offline.

| ID | Priority | Description | Acceptance Criteria | Notes |
|----|----------|-------------|---------------------|-------|
| OFFL-01 | P0 | 10,000+ mantras bundled in app at install time via Expo SQLite | App shows valid mantra on first gate with zero network calls | One-time batch generation before each release |
| OFFL-02 | P0 | Graceful degradation — all AI features fail silently with offline fallback | If Claude API unreachable, show cached results or "Try again when online"; gate never blocks | No gate failure states ever |
| OFFL-03 | P1 | Weekly fresh mantra pack — Supabase delivers 100 new mantras to Pro users when online | Background sync on app open; new mantras added to local SQLite | Pro feature |
| OFFL-04 | P1 | Seen-mantra sync across devices for Pro users | `seen_mantras` syncs to Supabase when online; conflict resolution = union of seen sets | Pro feature |
| OFFL-05 | P0 | Pre-generation pipeline script at `/scripts/generate-mantras.js` | Takes category + count as args; outputs validated JSON; idempotent; run before each release | Claude API batch job |

---

### 5.7 Onboarding (P0)

| ID | Priority | Description | Acceptance Criteria | Notes |
|----|----------|-------------|---------------------|-------|
| ONBD-01 | P0 | Welcome screen — brand moment, value prop, CTA | No back button; navigates to goals | Route: `/(auth)/welcome` |
| ONBD-02 | P0 | Goal selection — multi-select chips (15 categories) | Continue active after ≥1 selection; saved to `user_goals` on completion | Route: `/(auth)/goals` — Step 1 of 5 |
| ONBD-03 | P0 | App picker — curated suggested list of known time-wasting apps, searchable | 10 suggested apps shown by default; "Show all apps" expands to full list; Continue active after ≥1 selected; iOS triggers `FamilyActivityPicker` system sheet on Continue | Route: `/(auth)/apps` — Step 2 of 5 |
| ONBD-04 | P0 | Gate demo — full gate screen with guided tooltip overlay (7 steps) | Tooltips guide through mantra, heart (user must actually tap heart to advance), three-tap chant, and choice split; demo mantra hardcoded: *"Possibility always collapses in my favor."*; standalone component — do not reuse production gate | Route: `/(auth)/demo` — Step 3 of 5 |
| ONBD-05 | P0 | Permissions guide — all steps visible at once; "Open Settings →" deep links directly | iOS: `Linking.openURL('App-Prefs:SCREEN_TIME')`; auto-return detection via `AppState`; steps tick off automatically on return. Android: `Linking.openSettings()`; manual "I've done it ✓" confirmation | Route: `/(auth)/permissions` — Step 4 of 5 |
| ONBD-06 | P0 | Paywall — hard paywall, no skip, Pro pre-selected | Base/Pro toggle; annual pre-selected; CTA: "Start 7-day free trial"; navigates to home on success | Route: `/(auth)/paywall` — Step 5 of 5 |

---

### 5.8 Paywall & Monetisation (P0)

| ID | Priority | Description | Acceptance Criteria | Notes |
|----|----------|-------------|---------------------|-------|
| PAY-01 | P0 | RevenueCat integration for iOS + Android subscriptions | Subscriptions process correctly; webhooks update `user_settings.subscription_status` in Supabase | RevenueCat SDK |
| PAY-02 | P0 | No free tier — app requires active subscription | After subscription cancelled, gate mechanism pauses and `/paused` screen shown; auto-charge at day 7 of trial | Hard paywall; one clear ask |
| PAY-03 | P0 | Base tier — full access to Base features | `base` entitlement active; billing via RevenueCat | See pricing table in Section 4 |
| PAY-04 | P0 | Pro tier — full access to all features including Master Mantra | `pro` entitlement active; superset of Base | See pricing table in Section 4 |
| PAY-05 | P0 | 7-day full Pro trial — no credit card required on iOS | Trial starts at end of onboarding; full Pro feature access from day one; auto-charges selected plan at day 7 | iOS: no CC. Android: CC on file |

---

### 5.9 Journal & Tracking (P1)

| ID | Priority | Description | Acceptance Criteria | Notes |
|----|----------|-------------|---------------------|-------|
| JRNL-01 | P1 | Automatic log: every gate event with timestamp, app, mantra shown, action taken | Log entries on every gate event; accessible in Journal tab | Local-first, sync to Supabase |
| JRNL-02 | P1 | Streak counter: consecutive days with at least one mindful gate interaction | Streak increments at midnight; resets if no gate in 24hr; push notification at risk | Base: current streak + best streak only |
| JRNL-03 | P1 | Calendar heatmap — full month view with activity intensity | Three cell states: empty / active (1–4 gates) / high (5+ gates); today cell has `#7EC8C0` border; Base shows current month + last month; Pro shows all-time history | Base: 2 months. Pro: all time |
| JRNL-04 | P2 | Weekly insights: apps opened most, mantras completed, close rate trend | Insight card shown every Monday; shareable | Pro feature |

---

### 5.10 Schedules & Rituals (P1 — deferred to v1.x)

| ID | Priority | Description | Notes |
|----|----------|-------------|-------|
| SCHED-01 | P1 | Morning ritual mode: richer gate UX during configurable time window | Pro feature; deferred to v1.x |
| SCHED-02 | P1 | Wind-down mode: social apps hard-blocked after configurable time | Pro feature; deferred to v1.x |
| SCHED-03 | P2 | Weekend mode: different mantra set and gentler gates on weekends | Deferred to v1.x |

---

## 6. Technical Architecture

### 6.1 Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Mobile | React Native (Expo SDK 52+) | Single codebase iOS + Android; EAS Build |
| Navigation | Expo Router v4 | File-based routing |
| Language | TypeScript (strict mode) | No `any` types |
| App Gating — iOS v1.0 | Notification + App Group overlay | No entitlement required; ships immediately; see Section 6.4 |
| App Gating — iOS v1.1 | Screen Time API (FamilyControls / ManagedSettings) | Requires Apple entitlement; upgrade path after approval |
| App Gating — Android | UsageStatsManager + Accessibility Service overlay | Requires user permission grant |
| Backend / DB | Supabase (Postgres + Auth + Edge Functions) | Row Level Security on all tables |
| Auth | Supabase Auth (email + Apple SSO + Google SSO) | Pairs with RevenueCat user ID |
| Payments | RevenueCat SDK | Handles iOS + Android billing; webhooks to Supabase |
| AI — Mantra Gen | Anthropic Claude API (claude-sonnet-4-6) | Server-side only via Supabase Edge Functions |
| Local Storage | Expo SQLite | Offline mantra cache; seen_mantras dedup |
| Analytics | Mixpanel (events) + Amplitude (retention) | Mixpanel: funnel/gate events; Amplitude: cohort retention |
| Error Monitoring | Sentry (React Native SDK) | Session replay + crash reporting |
| Push | Expo Notifications (FCM + APNs) | Streak reminders, wind-down alerts |
| CI/CD | EAS Build + GitHub Actions | Automated TestFlight + Play Internal builds |
| Feature Flags | Posthog | A/B test paywall and gate UX |
| State | Zustand (global) + React Query (server) | |

### 6.2 Project Structure
```
pausemantra/
├── app/                        # Expo Router screens
│   ├── (auth)/                 # Onboarding stack
│   │   ├── welcome.tsx
│   │   ├── goals.tsx
│   │   ├── apps.tsx
│   │   ├── demo.tsx            # Gate demo — standalone component
│   │   ├── permissions.tsx
│   │   └── paywall.tsx
│   ├── (tabs)/                 # Main tab bar
│   │   ├── index.tsx           # Home
│   │   ├── library.tsx         # Library (Featured/Liked/Master tabs)
│   │   ├── journal.tsx
│   │   └── settings.tsx
│   ├── master-mantra.tsx       # Master Mantra screen (Pro)
│   ├── paused.tsx              # App Paused screen
│   └── index.tsx               # Splash
├── components/
│   ├── GateScreen/             # Production gate (not used in demo)
│   ├── MantraCard/
│   ├── HeartButton/
│   ├── MasterMantraCard/
│   ├── PaywallSheet/
│   └── ReflectionNoteModal/
├── lib/
│   ├── supabase.ts
│   ├── revenuecat.ts
│   └── sqlite.ts
├── hooks/
│   ├── useGate.ts
│   ├── useMantras.ts
│   ├── useSubscription.ts
│   └── useHearts.ts
├── supabase/
│   └── migrations/
├── scripts/
│   └── generate-mantras.js     # OFFL-05 batch generation
├── assets/
│   ├── mantras.db              # Bundled SQLite mantra library
│   └── stars/                  # Hand-drawn star PNGs for gate screen parallax
├── ios/                        # Native iOS (v1.0: notification gate; v1.1: Screen Time extension)
└── android/                    # Native Android (Accessibility Service)
```

### 6.3 Supabase Schema

```sql
-- All tables require RLS. Default policy: auth.uid() = user_id

-- user_settings
create table public.user_settings (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid references auth.users not null unique,
  gate_delay_seconds          int default 3,           -- 0 | 3 | 5 | 10
  reflection_prompts_enabled  boolean default false,   -- Pro only
  master_mantra_active        boolean default false,
  gate_mantra_id              uuid references public.master_mantras,
  subscription_status         text default 'trial',   -- 'trial' | 'active' | 'paused'
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

-- user_gated_apps
create table public.user_gated_apps (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users not null,
  app_name      text not null,
  bundle_id     text,           -- iOS
  package_name  text,           -- Android
  created_at    timestamptz default now()
);

-- mantras (master library — 10K+ rows at launch)
create table public.mantras (
  id          uuid primary key default gen_random_uuid(),
  text        text not null,
  category    text not null,   -- one of 15 categories
  source      text default 'curated', -- 'curated' | 'ai' | 'custom'
  active      boolean default true,
  created_at  timestamptz default now()
);

-- seen_mantras (lifetime dedup — MNTR-03)
create table public.seen_mantras (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  mantra_id   uuid references public.mantras not null,
  seen_at     timestamptz default now(),
  show_again  boolean default false,
  unique(user_id, mantra_id)
);

-- liked_mantras (hearts)
create table public.liked_mantras (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  mantra_id   uuid references public.mantras not null,
  created_at  timestamptz default now(),
  deleted_at  timestamptz,     -- soft delete
  unique(user_id, mantra_id)
);

-- master_mantras (AI synthesised)
create table public.master_mantras (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users not null,
  mantra_text     text not null,
  liked_count     int not null,
  created_at      timestamptz default now()
);

-- gate_events
create table public.gate_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  app_name    text not null,
  mantra_id   uuid references public.mantras,
  outcome     text not null,   -- 'entered' | 'closed'
  created_at  timestamptz default now()
);

-- gate_notes (reflection journal — Base feature)
create table public.gate_notes (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users not null,
  gate_event_id  uuid references public.gate_events not null,
  note_text      text not null,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- user_goals (onboarding category selection)
create table public.user_goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users not null,
  goal        text not null,
  created_at  timestamptz default now()
);

-- Required indexes
create index on public.gate_events (user_id, created_at desc);
create index on public.gate_notes (gate_event_id);
create index on public.liked_mantras (user_id);
create index on public.master_mantras (user_id, created_at desc);
create index on public.seen_mantras (user_id, mantra_id);
```

### 6.4 Gate Architecture — iOS

#### v1.0 — Notification-based approach (ship this first — no entitlement required)

```
Build this for launch. Does not require FamilyControls entitlement.
Apply for the entitlement in parallel — upgrade to v1.1 when approved.

How it works:
1. User selects apps to gate in onboarding — stored in user_gated_apps table
2. A local notification is pre-scheduled to fire when each gated app is opened
   (iOS 16+: use BGTaskScheduler or UNUserNotificationCenter with a foreground trigger)
3. When user taps a gated app, Pause Mantra fires a prominent banner notification
   with CTA: "Pause before you scroll →"
4. Tapping the notification opens Pause Mantra to the gate screen
5. User completes the three-tap chant → taps "Open for 1 hour"
6. Pause Mantra deep-links or guides user back to their original app
7. Gate is logged in gate_events regardless of outcome

Limitations vs v1.1:
- Does not physically block the app — a determined user can ignore the notification
- Requires Pause Mantra notification permission (prompt during onboarding)
- Slight friction increase (two taps instead of one to reach gated app)

Implementation notes:
- Request notification permissions during onboarding (before gate demo screen)
- Use UNUserNotificationCenter; category with "Open [App Name]" and "Stay focused" actions
- App picker in onboarding still uses custom UI (no FamilyActivityPicker needed)
- On the permissions screen, replace Screen Time steps with notification permission steps
```

#### v1.1 — Screen Time API / FamilyControls (upgrade path — apply for entitlement now)

```
Apply for com.apple.developer.family-controls entitlement in parallel with v1.0 build.
Approval takes 2–5 days. Upgrade to this when approved — do not block v1.0 on it.

1. ManagedSettings → apply ApplicationToken restrictions to user-selected apps
2. ShieldConfigurationDataSource → renders gate UI as native shield
3. Gate completion → unlock app via ApplicationToken for configurable duration
4. App picker: custom UI pre-selects apps → passes bundle IDs to FamilyActivityPicker
   system sheet → user confirms (cannot be skipped or replaced on iOS)

Upgrade notes:
- v1.1 fully blocks the app — no bypass possible
- Gate UI renders as native shield — much stronger friction
- Requires migrating app picker to trigger FamilyActivityPicker after custom selection
- Feature flag the upgrade via Posthog — roll out to users once tested
```

> Ship v1.0. Apply for entitlement. Upgrade to v1.1 silently when approved. Users get a better experience without a forced update.

### 6.5 Gate Architecture — Android

```
1. UsageStatsManager → monitors foreground app
2. When target app detected → TYPE_APPLICATION_OVERLAY renders gate UI
3. Full custom UI possible (no Apple restriction)
4. Required permissions: PACKAGE_USAGE_STATS + SYSTEM_ALERT_WINDOW
5. Battery optimisation exclusion required for reliable background monitoring
6. Test on Samsung, Xiaomi, Huawei — aggressive OEM battery management is the main risk
7. Foreground service with persistent notification as backup
```

### 6.6 Edge Functions

```typescript
// supabase/functions/synthesise-master-mantra/index.ts
// Takes user_id; fetches top 10 recently liked mantras;
// calls Claude API (claude-sonnet-4-6); stores result in master_mantras table

// supabase/functions/export-user-data/index.ts
// GDPR/CCPA compliance — generates JSON of all user data
// Emails or downloads to device on request from Settings

// CRITICAL: ANTHROPIC_API_KEY stored in Supabase secrets — never in app bundle
// Set via: supabase secrets set ANTHROPIC_API_KEY=your_key
```

### 6.7 Environment Variables

```bash
# .env.local — never commit

# Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-side only (scripts)

# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=

# Analytics
EXPO_PUBLIC_MIXPANEL_TOKEN=
EXPO_PUBLIC_AMPLITUDE_KEY=
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_SENTRY_DSN=

# Anthropic — goes in Supabase secrets NOT here
# supabase secrets set ANTHROPIC_API_KEY=your_key
```

---

## 7. Screen Inventory

### Navigation Structure
```
Auth Stack:   Splash → Welcome → Goals → App Picker → Gate Demo → Permissions → Paywall → Home
Tab Bar:      Home | Library | Journal | Settings
Other:        /master-mantra (Pro), /paused (cancelled subscription)
```

### All 16 Screens

> All screens have approved design mockups and full specs in the design handoff document. Read the relevant spec before building any screen.

| Screen | Route | Key Elements | Notes |
|--------|-------|-------------|-------|
| Splash | `/` | Animated logo entrance (lock icon → wordmark → tagline); pulse rings | Native splash matches JS splash to prevent flash; tagline: "mindful by design" |
| Welcome | `/(auth)/welcome` | Brand moment, value prop, proof points, CTA | No back button |
| Goal Selection | `/(auth)/goals` | Multi-select chips; 15 categories; progress bar step 1/5 | Saved to `user_goals` |
| App Picker | `/(auth)/apps` | Suggested time-wasting apps + search + "Show all"; progress bar step 2/5 | iOS: triggers `FamilyActivityPicker` on Continue |
| Gate Demo | `/(auth)/demo` | Full gate screen + 7-step tooltip overlay; progress bar step 3/5 | Standalone component; demo mantra: "Possibility always collapses in my favor." |
| Permissions | `/(auth)/permissions` | All steps visible; "Open Settings →" deep links; progress bar step 4/5 | Auto-detect platform; iOS auto-return; Android manual confirm |
| Paywall | `/(auth)/paywall` | Base/Pro tab toggle; plan cards; feature list; CTA; progress bar step 5/5 | Pro pre-selected; hard paywall no skip |
| Home | `/(tabs)/` | Greeting (time-aware); mantra card; 3 stat tiles (streak/today/liked); Master Mantra nudge (Pro) | Today tile opens gate log modal |
| Library | `/(tabs)/library` | Featured/Liked/Master tab strip; category chips grid | Category chips open mantra modal sheet; Master tab Pro-gated |
| Journal | `/(tabs)/journal` | Streak stats (3 tiles); full-month calendar heatmap; gate log with reflection notes | Base: current + last month. Pro: all time |
| Settings | `/(tabs)/settings` | Gated apps list (name + icon + remove); "I read this" button delay picker; reflection prompts toggle (Pro); account section (subscription, privacy, export, delete) | No per-app categories or delays |
| Master Mantra | `/master-mantra` | Ceremonial word-by-word reveal; Regenerate button; Set as gate mantra toggle; Share button; previous versions accordion | Pro only |
| App Paused | `/paused` | "Abundance is waiting for you." headline; body copy; Base/Pro/Lifetime plan tiles; "Come back" CTA | Shows only when user has actively cancelled subscription |

### Gate Screen (overlay — not a tab)

The gate screen is the most important screen in the app. It renders as a modal overlay outside the tab navigator.

| Element | Spec |
|---------|------|
| Mantra text | Cormorant Garamond italic 27px `#F3EEFF` centred line-height 1.55 |
| App label | App icon 32×32pt + app name Inter 11px `#D8B4FE` |
| Heart button | Top-right; always visible; fills `#7EC8C0` on tap; saves to `liked_mantras` |
| Pulse rings | Teal `rgba(126,200,192,0.12)` and `0.07`; 5s breathe cycle |
| Progress dots | 6px; active `#7EC8C0`; inactive `rgba(255,255,255,0.12)`; fill left-to-right |
| Stars | Hand-drawn PNG assets in `/assets/stars/`; 3 parallax depth layers; react-native-reanimated |
| Chant buttons | Same position; label+colour evolves each tap; entrance: scale 0.82→1, opacity 0→1, 0.9s cubic-bezier(0.16,1,0.3,1) |
| Choice split | After third tap; 1.1s same curve; close button hides |
| "I read this" delay | Global; configurable 0/3/5/10s; button inactive until delay complete |
| Close button | Ghost pill `rgba(216,180,254,0.15)` border; `#D8B4FE` text; hidden when choice appears |

---

## 8. Non-Functional Requirements

### Performance
- Gate screen must render in <2 seconds on a 4-year-old mid-range device
- App cold start <3 seconds on target devices
- Mantra fetch from local SQLite cache on gate (no network call required)
- Background monitoring service must not drain >3% battery per day

### Reliability
- Gate service uptime: 99.9% (background service staying alive)
- Supabase backend: 99.9% SLA (Pro plan)
- Offline mode: app fully functional without internet (local mantra cache)

### Security & Privacy
- `ANTHROPIC_API_KEY` never in client bundle — always via Supabase Edge Function
- No tracking of which apps users actually use — only gate events (entered/closed)
- Gate event logs are private; never shared with third parties
- Supabase Row Level Security enforced on all user tables
- GDPR/CCPA compliant: data export (`export-user-data` Edge Function) and deletion in Settings
- Apple App Privacy nutrition label: no data sold; minimal data collected
- Reflection notes are diary-level content — treat with care; Supabase Pro encrypts at rest

### Accessibility
- VoiceOver / TalkBack support on all screens including gate overlay
- Dynamic type support — mantra text scales with system font size
- Minimum touch target: 44×44pt on all interactive elements
- WCAG AA contrast ratio on all text elements

---

## 9. Launch Milestones

| Milestone | Target | Deliverables |
|-----------|--------|-------------|
| M0 — Setup | Week 1–2 | Repo init, Expo project, Supabase schema + RLS, RevenueCat config (all 5 product IDs), Apple Developer + Google Play accounts, 1Password vault, all external service accounts created. Apply for FamilyControls entitlement in background (non-blocking). |
| M1 — Alpha | Week 3–5 | Gate mechanism working (iOS v1.0 notification-based + Android full overlay), all onboarding screens (welcome → paywall), splash screen, 100 seed mantras in SQLite, basic auth |
| M2 — Beta | Week 6–9 | Full mantra library (OFFL-05 pipeline, 3,000+ mantras at launch), paywall + RevenueCat (both tiers), journal + heatmap, reflection notes (Base), hearts system, TestFlight + Play Internal |
| M3 — Soft Launch | Week 10–12 | ProductHunt launch, waitlist invite, 1K users, Sentry live, privacy policy live, A/B test paywall, App Store Optimisation (screenshots, icon, copy) |
| M4 — AI Features | Week 13–16 | Master Mantra synthesis (MSTR-01–06), reflection prompts on gate (Pro), custom mantras (MNTR-04), push notifications (streak reminders) |
| M5 — Growth | Month 5+ | Paid social, influencer program, Android OEM optimisation, referral loop, schedules & rituals (SCHED-01–02) |

---

## 10. Risks & Mitigations

| Risk | Severity | Mitigation | Contingency |
|------|----------|-----------|-------------|
| Apple rejects FamilyControls entitlement | LOW | v1.0 ships without it — notification-based approach works at launch; apply for entitlement in parallel | Already mitigated — v1.0 is the contingency |
| Android background service killed by OEM battery savers | HIGH | Detect and guide users to whitelist; test on Samsung, Xiaomi, Huawei | Foreground service with persistent notification |
| Low onboarding completion at permissions step | MED | All steps visible at once; "Open Settings" deep links directly; gate demo shown before to build commitment | A/B test permission ask timing |
| Competitor adds affirmation features | MED | Move fast; establish brand in manifestation community first | Double down on AI personalisation moat |
| App Store rejection (mimicking OS UI) | MED | Gate design clearly distinct from system UI; Apple HIG compliant | Submit design for pre-review via Apple Developer Relations |
| Claude API costs spike at scale | LOW | Cache AI mantras; Edge Function caching; generate weekly batches not per-gate | Switch to lighter model at scale |

---

## 11. Open Questions

### Must resolve before M0
- [ ] Apply for Apple FamilyControls entitlement in background — non-blocking for v1.0 build; upgrade to v1.1 gate when approved
- [ ] Set up Apple Developer account ($99/yr) and Google Play Console ($25 one-time)
- [ ] Register pausemantra.com and pausemantra.app domains
- [ ] Set up 1Password with dedicated Pause Mantra vault
- [ ] Create Supabase project and copy URL + keys to `.env.local`
- [ ] Create RevenueCat account, create all 5 products in both stores, copy API keys
- [ ] Create Anthropic API key → set in Supabase secrets (never in app bundle)
- [ ] Apply for Apple Small Business Program (15% cut vs 30% on first $1M)
- [ ] Legal: Terms of Service and Privacy Policy needed before any beta users
- [ ] Run OFFL-05 pre-generation pipeline to build initial mantra library before M1 alpha
- [ ] Android trial behaviour — accept Apple/Google asymmetry (recommended) or use RevenueCat workaround
- [x] ~~App name~~ — **resolved: Pause Mantra** | Bundle ID: com.pausemantra.app
- [x] ~~Paywall position~~ — **resolved: no free tier, hard trial-to-paid model**
- [x] ~~Two-tier model~~ — **resolved: Base and Pro with pricing as above**
- [x] ~~App paused state UX~~ — **resolved: see /paused screen design in handoff doc**
- [x] ~~Per-app mantra categories~~ — **resolved: deferred to v1.x; global categories in v1.0**

### Deferred to v1.x
- Social sharing of mantra streaks (JRNL-04)
- Master Mantra audio / TTS (MSTR-08)
- Liked list shareable image card (HEART-05)
- Master Mantra shareable visual card (MSTR-07)
- Custom mantras (MNTR-04)
- Per-app mantra category assignment (original MNTR-05)
- Schedules & Rituals (SCHED-01 through SCHED-03)
- Gifting / family plans
- Android home screen widget (daily mantra)
- Apple Watch integration
- Weekly insights (JRNL-04 original)

---

*Pause Mantra PRD v1.1 — March 2026 — Confidential*
