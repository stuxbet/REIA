# 04 — Tech Stack Recommendation

_Last updated: 2026-06-29_

## The deciding constraint

You want an **iOS-only** app but develop on **Windows**. Native iOS (Swift/SwiftUI) hard-requires Xcode, which only runs on macOS. So the real question isn't "what's the best iOS stack" — it's **"what's the best iOS stack I can build and ship without a Mac."** That single constraint drives everything below.

## Recommendation: React Native + Expo + EAS Build (TypeScript)

The only mainstream toolchain that lets you **write, device-test, and ship to the App Store entirely from Windows** — Expo Application Services (EAS) compiles and code-signs iOS builds in the cloud.

### The Windows → iPhone pipeline (no Mac, ever)
1. **Develop** on Windows in VS Code; run `npx expo start`.
2. **Test on your real iPhone** instantly via the **Expo Go** app (scan a QR code) — no build, no Mac, no developer account for this stage.
3. When you need custom native modules, build a **development client** with **`eas build`** (cloud) and install it on your device.
4. **Ship**: `eas build` (cloud iOS build) → `eas submit` → **TestFlight** → App Store. EAS manages provisioning profiles and signing certs in the cloud for you.

**The one unavoidable cost:** an **Apple Developer Program** membership (**$99/year**) is required for TestFlight and App Store distribution (and for installing dev builds on your device beyond Expo Go). No way around that for any iOS app — but you do *not_ need a Mac.

## Stack by layer

| Layer | Choice | Why |
| --- | --- | --- |
| **Language** | **TypeScript** | Type safety matters most in the calculator; catches unit/decimal bugs |
| **App framework** | **React Native via Expo (managed)** | Best Windows→iOS story; huge ecosystem |
| **Build/release** | **EAS Build + EAS Submit** | Cloud iOS builds + signing without a Mac |
| **Navigation** | **Expo Router** | File-based routing, deep links for free |
| **UI components** | **Tamagui** or **React Native Paper** + **NativeWind** | Fast, themeable; NativeWind = Tailwind ergonomics |
| **Server state** | **TanStack Query** | Caching/retries for listing-data API calls |
| **Client state** | **Zustand** | Minimal boilerplate for calculator/buy-box state |
| **Local persistence** | **expo-sqlite** (deals) + **MMKV** (settings) | Local-first; survives offline; fast |
| **Calculator engine** | **Pure TS module** (`calc/brrrr.ts`) | Framework-agnostic, unit-tested per spec |
| **Maps** | **react-native-maps** (Apple Maps on iOS, free) | Native, free on iOS; Mapbox later for heatmaps |
| **Location & geocoding** | **expo-location** (foreground only) | Current-location pins + reverse-geocode to address; no background tracking → no extra permission/review in v1 |
| **Camera & photos** | **expo-camera** / **expo-image-picker** + **expo-file-system** | Capture and store lead photos locally |
| **Outreach handoff** | **expo-linking** (`mailto:`/`sms:`/`tel:`) + React Native **Share** API + **expo-print** | Compose in-app, send via the user's own Mail/Messages/Phone or export a printable letter — **no backend send path** |
| **Charts** | **Victory Native** or **react-native-svg** | Sensitivity grids, trend overlays |
| **Backend (optional)** | **Supabase** (Postgres + Auth + Edge Functions) | Generous free tier; only when you add sync/scouting |
| **Data ingestion** | **Supabase Edge Functions** (or small Node service) | Server-side calls to RentCast/HUD; keeps API keys off-device, enables caching |
| **Testing** | **Jest** + **React Native Testing Library** | Calculator gets snapshot tests vs. the worked example |
| **Tooling** | VS Code, Node LTS, pnpm, Expo CLI, EAS CLI, Expo Go | Standard RN dev loop on Windows |

> **Local-first stance:** the MVP needs **no backend at all** — calculator + SQLite is fully functional offline. Add Supabase only when you introduce the deal feed (Epic 3) or cloud sync (Epic 7). This matches the "free/low-cost" decision: you pay for nothing until you need scouting data.

## Alternatives considered

| Option | Verdict | Why not (for you) |
| --- | --- | --- |
| **Native Swift / SwiftUI** | ❌ Rejected | The "natural" iOS-only choice, but hard-requires macOS/Xcode. Would mean buying a Mac or renting a cloud Mac (MacStadium/MacinCloud, ~$20–60/mo) — extra cost and friction for zero benefit given your app isn't graphics/AR-heavy. |
| **Flutter + Codemagic** | ◑ Viable runner-up | Also builds iOS from Windows via cloud CI; great performance, Dart is pleasant. Rejected only because RN/Expo's release pipeline (EAS) is more turnkey and the JS/TS ecosystem for the data/API glue is deeper. Pick this if you prefer a more opinionated, batteries-included framework. |
| **.NET MAUI** | ❌ Rejected | C# is nice and you're on Windows, but iOS builds still effectively need a networked Mac, and the mobile ecosystem/community is thinner. |
| **No-code (FlutterFlow, etc.)** | ❌ Rejected | You're an experienced dev; the BRRRR calculator's logic and the data integrations will outgrow no-code fast. |
| **PWA / web-only** | ❌ Rejected | You want a real iPhone app; iOS PWA limitations (background, maps, install friction) undercut the scouting features. |

## Cost summary (free/low-cost path)

| Item | Cost |
| --- | --- |
| Expo + EAS | Free tier covers low build volume; paid tiers optional later |
| Apple Developer Program | **$99/year** (required to ship — unavoidable) |
| Supabase | Free tier (add only when needed) |
| RentCast / HUD / Census / Apple Maps | Free tiers / free (see [`01-deal-scouting.md`](01-deal-scouting.md)) |
| **Total to start** | **~$99/year** until you scale data usage |

## Project structure (suggested)

```
/app            # Expo Router screens
/components     # UI components
/calc           # pure BRRRR engine (brrrr.ts) + tests  ← framework-agnostic
/leads          # driving-for-dollars: map, pin capture, enrichment, outreach handoff
/data           # API clients (RentCast, HUD), query hooks
/store          # Zustand stores (deal, lead, buybox, settings)
/db             # expo-sqlite schema + repositories (deals + leads)
/lib            # formatting, money/percent helpers, deep-link + template builders
/docs           # these planning docs
```

Keeping `/calc` isolated and pure is the single most important architectural rule: it's the part that must be correct, it's the most testable, and it's the part you could even reuse on a future web/Android target.
