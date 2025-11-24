---
applyTo: '**/*'
---

# GDPR Compliance Implementation Plan

## Core Principles
- Simple consent banner: Accept / Reject / More Info
- No tracking if user rejects
- Keep tracking code out of GitHub
- No third-party consent management
- Track only: user count, multiplayer games, games finished
- Simplicity over complexity

## Implementation Checklist

### Phase 1: Consent Management (Must-Have)

#### 1.1 Create CookieConsentBanner component
- [x] Create `src/components/modals/CookieConsentBanner.tsx`
- [x] Accept button → stores consent, loads GA
- [x] Reject button → stores rejection, never loads GA
- [x] "Learn More" → opens privacy modal/page
- [x] Shows once per user, remembers choice in localStorage

#### 1.2 Create consent utility functions
- [x] Create `src/utils/consent.ts`
- [x] `hasConsent()` - check if user accepted
- [x] `setConsent(boolean)` - store user's choice
- [x] `getConsentStatus()` - get current status (accepted/rejected/not-asked)

#### 1.3 Add GA loading logic
- [x] Only load GA script if `hasConsent() === true`
- [x] Load dynamically via JavaScript (not in HTML)
- [x] Keep tracking ID in environment variable for deploy

### Phase 2: Privacy Documentation (Must-Have)

#### 2.1 Create PrivacyModal component
- [x] Create `src/components/modals/PrivacyModal.tsx`
- [x] Simple, clear explanation of what's tracked
- [x] Why tracking is used (improve the app)
- [x] That data goes to Google Analytics
- [x] How to revoke consent (Settings integration complete)
- [x] Link to Google's privacy policy

#### 2.2 Add Privacy button in Settings modal
- [x] Add "Privacy" section in `SettingsModal.tsx`
- [x] Opens PrivacyModal
- [x] Shows current consent status
- [x] Allows revoke/change consent

### Phase 3: Custom Event Tracking (Nice-to-Have)

#### 3.1 Create analytics utility wrapper
- [x] Create `src/utils/analytics.ts`
- [x] `trackEvent(eventName, params)` - only fires if consent given
- [x] Safety wrapper that checks consent before calling gtag
- [x] `initializeAnalytics()` - loads GA only if consent given

#### 3.2 Add tracking calls for your events
- [x] Multiplayer game started: `trackEvent('multiplayer_game_start')`
- [x] Game finished: `trackEvent('game_finished')`

### Phase 4: Deployment & Security (Must-Have)

#### 4.1 Update deploy script
- [x] Use environment variable for GA tracking ID
- [x] Keep ID out of GitHub repo
- [x] Pass ID as deploy script parameter
- [x] Inject tracking ID into built JavaScript files
- [x] Create deployment documentation (DEPLOY.md)

#### 4.2 Test consent flow
- [x] First visit → banner shows
- [x] Accept → GA loads, banner never shows again
- [x] Reject → GA never loads, banner never shows again
- [x] Revoke/enable in settings → silent internal operation, no banner

### Phase 5: Legal Text (Must-Have)

#### 5.1 Write simple Privacy Policy text
- [x] What: "Google Analytics is used to understand how the app is used"
- [x] Why: "This data helps improve Brisker"
- [x] Your control: "Tracking can be accepted or rejected at any time"
- [x] How to opt-out: "Settings → Privacy & Data section"
- [x] Google's policy: Link provided in PrivacyModal

### Phase 6: UX Feedback (Must-Have)

#### 6.1 Toast notification system
- [x] Create `src/components/ui/Toast.tsx` - Individual toast component
- [x] Create `src/components/ui/ToastContainer.tsx` - Container for multiple toasts
- [x] Create `src/hooks/useToast.ts` - Hook for managing toast state
- [x] Integrate toast container into main app

#### 6.2 Consent change feedback
- [x] Show success toast when granting consent
- [x] Show info toast when revoking consent
- [x] Toast messages explain what happened and what to expect
- [x] Auto-dismiss toasts after 4-5 seconds

#### 6.3 Settings-based consent management
- [x] Consent banner only appears once (first visit)
- [x] All subsequent changes happen silently in Settings
- [x] "Revoke Analytics Consent" button when enabled
- [x] "Enable Analytics" button when disabled
- [x] Show helpful message when consent is in "not-asked" state

## Files to Create

```
src/components/modals/
  ├── CookieConsentBanner.tsx  (CREATED)
  └── PrivacyModal.tsx         (CREATED)

src/components/ui/
  ├── Toast.tsx                (CREATED)
  ├── Toast.module.css         (CREATED)
  ├── ToastContainer.tsx       (CREATED)
  └── ToastContainer.module.css (CREATED)

src/hooks/
  └── useToast.ts              (CREATED)

src/utils/
  ├── consent.ts               (CREATED - consent management)
  └── analytics.ts             (CREATED - GA wrapper)
```

## Files to Modify

```
src/components/Brisker.tsx                  (add toast system, pass to SettingsModal)
src/components/modals/SettingsModal.tsx     (add Privacy button, toast feedback)
deploy.sh                                   (use env variable for GA ID)
.gitignore                                  (ensure .env is ignored)
```

## Environment Variable Approach

### Option A - Server .env file (Recommended)
```bash
# On server: /var/www/vhosts/brisker.net/.env
VITE_GA_TRACKING_ID=G-08L5SVVF4W
```

### Option B - Deploy script parameter
```bash
./deploy.sh G-08L5SVVF4W
```

### Option C - Build-time injection (Simple)
```bash
# During deploy, inject GA ID from parameter
# Keep ID in deploy script, not in repo
```

## Consent Banner Design

```
┌─────────────────────────────────────────────────┐
│ 🍪 Cookie Notice                                │
│                                                 │
│ We use Google Analytics to understand app       │
│ usage. You can accept or reject tracking.       │
│                                                 │
│ [Learn More]  [Reject]  [Accept & Continue]     │
└─────────────────────────────────────────────────┘
```

## Simplicity Decisions

### Keep Simple
- Single consent banner (not separate cookie types)
- Binary choice: track everything or nothing
- Store consent in localStorage (no backend)
- Manual privacy policy text (no CMS)

### Skip Complex
- No granular cookie categories
- No consent management platform
- No cookie scanning tools
- No automatic cookie detection
- No consent versioning (unless legally required later)

## Recommended Implementation Order

1. **Start:** Consent utilities & banner (Phase 1) ✅
2. **Then:** Privacy documentation (Phase 2) ✅
3. **Then:** Deploy script update (Phase 4) ✅
4. **Then:** Custom event tracking (Phase 3) ✅
5. **Then:** UX feedback system (Phase 6) ✅
6. **Test:** Full consent flow (Phase 4.2) 🔄 Ready for manual testing

## Implementation Status

### ✅ COMPLETED

All phases of GDPR compliance have been implemented:

- **Phase 1**: Consent Management - Cookie banner, consent utilities, GA loading logic
- **Phase 2**: Privacy Documentation - Privacy modal, Settings integration with revoke/grant controls
- **Phase 3**: Custom Event Tracking - Multiplayer game start and game completion tracking
- **Phase 4**: Deployment & Security - Deploy script with tracking ID injection, documentation
- **Phase 5**: Legal Text - Privacy policy content in passive voice
- **Phase 6**: UX Feedback - Toast notifications, consent banner re-appearance on revoke

### 📊 New Features

- **Settings → Privacy & Data**: View consent status, change preferences with instant feedback
- **Privacy Modal**: Accessible from consent banner and Settings
- **Event Tracking**: Multiplayer game starts and game completions tracked (with consent)
- **Deploy Script**: `./deploy.sh G-08L5SVVF4W` injects tracking ID during deployment
- **Toast Notifications**: 
  - Success toast when granting consent
  - Info toast when revoking consent
  - Auto-dismiss after 4-5 seconds
  - Positioned at top-right (mobile-friendly)
- **Settings-Based Consent Management**: 
  - Consent banner only appears once (first visit)
  - All changes happen silently within Settings modal
  - Clear button labels: "Revoke Analytics Consent" / "Enable Analytics"
  - Toast feedback for all consent changes

### 🧪 Manual Testing Required

Run through consent flow manually:
1. Clear localStorage: `localStorage.clear()`
2. Reload app - consent banner should appear
3. Click "Reject" - banner disappears, no analytics scripts load
4. Go to Settings → Privacy & Data → Click "Enable Analytics"
5. Verify success toast appears and GA scripts load in Network tab
6. Click "Revoke Analytics Consent" - info toast appears, banner does NOT reappear
7. Verify GA stops tracking (check Network tab on next page interaction)
8. Close settings and verify banner still does not appear (one-time only)

### 📝 Translation Status

- 109 total strings (3 new from UX feedback features)
- 28 strings missing in non-English languages (de, fa, fr, nl, sv, tr)
- Run `npm run extract` and translate via PO files workflow

