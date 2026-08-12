# Amazon Repricer — Public Website: Full Architecture & Build Spec

**Purpose of this document:** Hand this directly to an IDE coding agent (Codex, Claude Code, Cursor, etc.) as the single source of truth to build the public marketing + checkout website for Amazon Repricer. It is not a prompt — it is a spec: architecture, file structure, page-by-page content, and the exact logic each component needs.

**Why this site exists (business context):** Paddle Billing requires a public, Paddle-approved website domain before Live checkout will work. `localhost` only works in Sandbox. This site is that public domain — it must look like a real SaaS product (pricing, legal pages, support contact) or Paddle's manual review can reject it. It also doubles as the actual marketing site and checkout entry point for the product.

---

## 1. Goals & Constraints

1. Get approved by Paddle's Website Approval review (Checkout → Website approval).
2. Serve as the real marketing/landing site for Amazon Repricer.
3. Host the three plan-specific checkout pages (Starter, Business, Professional) that already exist in `checkout/public/` (built with Paddle.js, per prior work).
4. Deployable to Netlify with zero paid dependencies to start (custom domain added later without re-doing Paddle approval — you just add the new domain alongside the Netlify one).
5. No backend required for the marketing pages. The checkout pages already call Paddle.js client-side; keep that pattern — don't introduce a server unless you already have one for webhooks (see §7).
6. Must NOT contain: sandbox-only debug controls, auto-popup checkout, fake testimonials/logos, or placeholder Lorem Ipsum in the shipped version.

---

## 2. Recommended Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Site type | Static site (HTML/CSS/JS) or lightweight static-site generator (Astro or plain Vite) | Matches your existing `checkout/public` vanilla-JS pattern, fastest Paddle approval (no server needed), free Netlify hosting |
| Styling | Plain CSS with CSS variables (design tokens) — no framework required | Keeps bundle tiny, matches existing `styles.css` | 
| Checkout integration | Paddle.js (Paddle Billing overlay or inline checkout) | Already integrated in `checkout/public/app.js` — reuse the same client, don't rebuild it |
| Hosting | Netlify (static hosting + forms for contact, if used) | Free tier, instant deploy URL Paddle accepts for approval |
| Analytics (optional) | Plausible or none | Avoid anything that adds a cookie consent burden you don't need yet |

If you already have Astro/Next.js elsewhere in the repo, use that instead — the file structure below adapts either way (see §4 note).

---

## 3. Site Architecture (Page Map)

```
/                       → Home / Landing
/pricing                → Plan comparison (Starter / Business / Professional)
/pricing/starter        → Starter checkout page (embeds Paddle.js)
/pricing/business       → Business checkout page (embeds Paddle.js)
/pricing/professional   → Professional checkout page (embeds Paddle.js)
/features               → Feature breakdown (repricing rules, Amazon integration, etc.)
/support                → Support / contact (email + FAQ)
/legal/terms            → Terms of Service
/legal/privacy          → Privacy Policy
/legal/refund-policy     → Refund / Cancellation Policy  ← Paddle explicitly checks for this
/checkout/success       → Post-payment confirmation page (Paddle redirects here)
/checkout/error         → Friendly error page (fallback if Paddle overlay fails)
404                     → Not found page
```

**Why the legal pages matter for approval:** Paddle's manual reviewers specifically look for Terms, Privacy, and Refund/Cancellation policy pages, a working support contact, and clear pricing before approving a domain for Live checkout. Missing any of these is the single most common cause of rejection.

---

## 4. Complete File Structure

```
amazon-repricer-website/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   └── assets/
│       ├── images/
│       │   ├── logo.svg
│       │   ├── og-image.png              # social share preview, 1200x630
│       │   └── screenshots/              # product screenshots for landing/features
│       └── fonts/                        # only if self-hosting fonts
│
├── src/
│   ├── index.html                        # Home
│   ├── pricing/
│   │   ├── index.html                    # Plan comparison table
│   │   ├── starter.html                  # Starter checkout (Paddle.js)
│   │   ├── business.html                 # Business checkout (Paddle.js)
│   │   └── professional.html             # Professional checkout (Paddle.js)
│   ├── features/
│   │   └── index.html
│   ├── support/
│   │   └── index.html
│   ├── legal/
│   │   ├── terms.html
│   │   ├── privacy.html
│   │   └── refund-policy.html
│   ├── checkout/
│   │   ├── success.html
│   │   └── error.html
│   ├── 404.html
│   │
│   ├── styles/
│   │   ├── tokens.css                    # CSS variables: colors, spacing, type scale
│   │   ├── base.css                      # resets, typography defaults
│   │   ├── layout.css                    # header, footer, grid/containers
│   │   ├── components.css                # buttons, cards, pricing table, nav
│   │   └── checkout.css                  # styles specific to checkout pages (reuse/extend existing styles.css)
│   │
│   └── scripts/
│       ├── paddle-client.js              # single shared Paddle.js init + config (env-driven)
│       ├── checkout-starter.js           # page-specific: opens Starter price ID
│       ├── checkout-business.js          # page-specific: opens Business price ID
│       ├── checkout-professional.js      # page-specific: opens Professional price ID
│       ├── nav.js                        # mobile nav toggle, active-link highlighting
│       └── analytics.js                  # optional, no-op if not using analytics
│
├── netlify.toml                          # build & redirect config
├── .env.example                          # documents required env vars (no secrets committed)
├── package.json                          # only if using a bundler; omit if pure static
└── README.md                             # deploy + Paddle setup instructions for future-you
```

**Note on integrating with your existing repo:** Your current checkout app lives at `checkout/public/index.html`, `styles.css`, `app.js` with Sandbox/Live logic already built (per your prior Codex session — 32 tests passing). Two valid approaches:

- **Option A (recommended, fastest to approval):** Keep `checkout/public/` as-is (it's your working Paddle.js integration). Build this new marketing site as a *separate* Netlify site/repo that **links out** to your existing checkout pages via absolute URLs, OR
- **Option B (cleaner long-term):** Merge — copy the marketing pages above into the same repo alongside `checkout/public/`, so one Netlify deploy serves both the marketing site and the checkout flow under one domain (e.g. `/`, `/pricing`, `/checkout/*`). This avoids having two separate domains to get Paddle-approved.

Go with **Option B**. Paddle approves one domain; you want your pricing pages and your checkout pages living under that same approved domain.

---

## 5. Design Tokens (put in `styles/tokens.css`)

Give the IDE agent concrete tokens so it doesn't invent generic Bootstrap-blue defaults:

```css
:root {
  /* Color */
  --color-bg: #0b0e14;
  --color-surface: #131722;
  --color-surface-raised: #1b2130;
  --color-border: #2a2f3d;
  --color-text-primary: #f2f4f8;
  --color-text-secondary: #9aa3b2;
  --color-accent: #4f8cff;        /* pick a real brand color, not default blue */
  --color-accent-hover: #6ea0ff;
  --color-success: #33c481;
  --color-error: #e5484d;
  --color-warning: #e0a72e;

  /* Type */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --scale-sm: 0.875rem;
  --scale-base: 1rem;
  --scale-lg: 1.25rem;
  --scale-xl: 1.75rem;
  --scale-2xl: 2.5rem;

  /* Spacing (4px base) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;
  --space-12: 48px; --space-16: 64px;

  /* Radius / shadow */
  --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px;
  --shadow-card: 0 4px 24px rgba(0,0,0,0.25);
}
```

Instruct the agent: no unstyled default `<button>`/`<input>` — every interactive element uses these tokens. Dark theme by default (matches a repricing/SaaS-dashboard product); optionally add a light-mode toggle later, not required for launch.

---

## 6. Page-by-Page Content & Logic

### 6.1 `/` — Home
**Content required (no Lorem Ipsum):**
- Hero: one sentence describing what Amazon Repricer does (automated Amazon price repricing), a primary CTA ("View Pricing" → `/pricing`), secondary CTA ("See Features" → `/features`).
- 3–4 feature highlights with icons (e.g. rule-based repricing, real-time Amazon SP-API sync, win-the-Buy-Box logic, margin protection floor/ceiling).
- A simple "How it works" 3-step section (Connect Amazon account → Set pricing rules → Repricer runs automatically).
- Pricing teaser (3 cards, linking to `/pricing`).
- Footer with links to Terms, Privacy, Refund Policy, Support — **this footer must appear on every page**, it's what Paddle reviewers check first.

**Logic:** static content, no JS required beyond `nav.js` for mobile menu.

### 6.2 `/pricing` — Plan Comparison
**Content:** a real comparison table — Starter / Business / Professional — with:
- Price (monthly, and annual if you support it)
- Feature checklist per tier (number of SKUs repriced, update frequency, marketplaces supported, support tier)
- A "Choose plan" button per column linking to `/pricing/starter`, `/pricing/business`, `/pricing/professional` respectively

**Logic:** static table; no Paddle.js needed on this page — that lives on the plan-specific pages so Paddle only loads where a purchase can actually happen (cleaner for approval review and page weight).

### 6.3 `/pricing/{plan}.html` — Individual Checkout Pages
This is where you plug in the Paddle.js work already done in `checkout/public/app.js`. Logic spec:

```js
// scripts/paddle-client.js
// Single shared init, reused by all three plan pages.

const PADDLE_ENV = window.__ENV__.PADDLE_ENV;         // "sandbox" | "production"
const PADDLE_CLIENT_TOKEN = window.__ENV__.PADDLE_CLIENT_TOKEN;

function initPaddle() {
  if (!window.Paddle) {
    console.error('Paddle.js failed to load');
    showConnectionStatus('error', 'Payment system unavailable. Please refresh or contact support.');
    return null;
  }

  Paddle.Environment.set(PADDLE_ENV);
  Paddle.Initialize({
    token: PADDLE_CLIENT_TOKEN,
    eventCallback: handlePaddleEvent
  });

  showConnectionStatus('connected', 'Payments ready');
  return Paddle;
}

function handlePaddleEvent(event) {
  switch (event.name) {
    case 'checkout.loaded':
      showConnectionStatus('loading', 'Loading checkout…');
      break;
    case 'checkout.completed':
      window.location.href = '/checkout/success.html?txn=' + event.data.transaction_id;
      break;
    case 'checkout.closed':
      // user dismissed the overlay — do nothing destructive, just log
      console.info('Checkout closed by user');
      break;
    case 'checkout.error':
      showConnectionStatus('error', 'Something went wrong starting checkout. Please try again or contact support.');
      console.error('Paddle checkout error:', event.data);
      break;
  }
}

function showConnectionStatus(state, message) {
  const el = document.querySelector('[data-connection-status]');
  if (!el) return;
  el.textContent = message;
  el.dataset.state = state; // "connected" | "loading" | "error" — styled via CSS
}
```

```js
// scripts/checkout-starter.js  (business.js and professional.js are identical, swap the price ID)

document.addEventListener('DOMContentLoaded', () => {
  const paddle = initPaddle();
  if (!paddle) return;

  const openBtn = document.querySelector('[data-checkout-trigger]');
  openBtn.addEventListener('click', () => {
    Paddle.Checkout.open({
      items: [{ priceId: window.__ENV__.PRICE_ID_STARTER, quantity: 1 }],
      settings: {
        displayMode: 'overlay',
        theme: 'dark',
        successUrl: window.location.origin + '/checkout/success.html'
      }
    });
  });
});
```

**Explicit requirements per plan page (matches what you already fixed with Codex — keep these):**
- No automatic popup on page load — checkout only opens on a real button click (`data-checkout-trigger`).
- Visible connection-status element (`[data-connection-status]`) so the user sees "Payments ready" / "Loading…" / an actual error message instead of a silent failure.
- No Sandbox-only debug controls visible in the Live/production build — gate those behind `if (PADDLE_ENV === 'sandbox')`.
- Plan name, price, and a short feature recap shown above the "Subscribe" button (don't make the user go back to `/pricing` to remember what they picked).

### 6.4 `/checkout/success.html`
- Confirms payment received, thanks the user, gives next steps (e.g. "check your email for login instructions" or a link into the app dashboard).
- Reads `?txn=` from the URL only to display a reference number — no sensitive data handling client-side.

### 6.5 `/checkout/error.html`
- Friendly fallback: "Something went wrong. Your card was not charged." + support email + link back to `/pricing`.

### 6.6 `/features`
- Expand on the 3–4 home-page highlights with real detail: repricing rule engine, Amazon SP-API integration specifics, supported marketplaces, update frequency, reporting/analytics if you have it.

### 6.7 `/support`
- Support email (real inbox you monitor — Paddle checks this resolves).
- Optional short FAQ (billing questions: "How do I cancel?", "Do you offer refunds?", "How is my Amazon data used?").
- Optional Netlify Forms contact form (no backend needed):
```html
<form name="support" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="support" />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

### 6.8 `/legal/terms`, `/legal/privacy`, `/legal/refund-policy`
- These must be real, specific documents — not generic filler. At minimum:
  - **Terms:** what the service does, subscription billing terms, acceptable use, account termination.
  - **Privacy:** what data you collect (Amazon account data, email, usage analytics), how it's stored, third parties involved (Paddle for payments, Amazon SP-API), user rights/contact for data requests.
  - **Refund Policy:** your actual policy — e.g. "no refunds for partial billing periods, full refund within 7 days of first charge if requested by [support email]." Paddle explicitly wants a clear, findable refund/cancellation policy since Paddle is the Merchant of Record and enforces consumer-protection rules on your behalf.
- Link a lawyer-reviewed version once you have real users; a clear, honest draft is enough to pass approval and launch.

---

## 7. Environment & Secrets

`.env.example` (document, never commit real values):
```
PADDLE_ENV=production
PADDLE_CLIENT_TOKEN=your_live_client_side_token
PRICE_ID_STARTER=pri_xxx
PRICE_ID_BUSINESS=pri_xxx
PRICE_ID_PROFESSIONAL=pri_xxx
SUPPORT_EMAIL=support@yourdomain.com
```

Since this is a static site, these get injected at build time (Netlify build environment variables → inline into a small `window.__ENV__ = {...}` script tag generated at build, or a Netlify Edge Function if you want them hidden — client token is meant to be public, so a simple build-time injection is fine).

`netlify.toml`:
```toml
[build]
  publish = "src"
  command = "echo 'static site, no build step'"  # replace if using a bundler

[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404
```

---

## 8. Deployment Workflow (step order matters)

1. Build the site per the structure above.
2. `netlify deploy` (or connect the GitHub repo to Netlify) → get `your-app.netlify.app`.
3. Verify every page loads, footer legal links work, and the three checkout pages open Paddle's overlay on click (test in Sandbox first — `PADDLE_ENV=sandbox`).
4. Switch to Live: set `PADDLE_ENV=production`, plug in the Live client token and the three Live price IDs (already configured per your prior work).
5. In Paddle → Checkout → Website approval: submit `your-app.netlify.app`.
6. Wait for approval.
7. In Paddle → Checkout → Checkout settings: set the approved site's subscription/pricing page as the Default payment link.
8. Re-test a real Live transaction end-to-end.
9. (Later, optional) buy a custom domain, point it at Netlify, add it in Paddle alongside the existing approved domain.

---

## 9. Pre-Launch Checklist (give this to the IDE agent as acceptance criteria)

- [ ] Every page has the shared footer with Terms / Privacy / Refund Policy / Support links
- [ ] `/legal/terms`, `/legal/privacy`, `/legal/refund-policy` contain real, specific content — no placeholder text
- [ ] Support email on `/support` is real and monitored
- [ ] Pricing is clearly stated in real currency, no "Contact us for pricing" ambiguity for Paddle review
- [ ] No automatic checkout popups anywhere
- [ ] No Sandbox-only controls visible when `PADDLE_ENV=production`
- [ ] `data-connection-status` element shows real state (connected/loading/error), not silently failing
- [ ] `/checkout/success.html` and `/checkout/error.html` both exist and are linked from Paddle's `successUrl`/error handling
- [ ] `robots.txt` and `sitemap.xml` present (Paddle reviewers and basic SEO both benefit)
- [ ] Site tested fully in Sandbox before flipping to Live
- [ ] Mobile responsive (single-column pricing cards, collapsible nav) — test at 375px width minimum
- [ ] No console errors on any page
