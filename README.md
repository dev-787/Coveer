![Coveer Banner](./Assets/Cover.png)

<div align="center">

# 🛡️ Coveer
### *Parametric Income Protection for India's Gig Workers*

**The first AI-powered insurance system that monitors, measures, and pays — automatically.**

[![React](https://img.shields.io/badge/React_19-0a0a0a?style=flat&logo=react&logoColor=61DAFB)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-0a0a0a?style=flat&logo=node.js&logoColor=68A063)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-0a0a0a?style=flat&logo=mongodb&logoColor=47A248)](https://mongodb.com)
[![Python](https://img.shields.io/badge/Python_FastAPI-0a0a0a?style=flat&logo=fastapi&logoColor=009688)](https://fastapi.tiangolo.com)

</div>

---

## The Problem — ₹2,400 Lost Every Month

India has **11+ million gig delivery workers** on Zomato, Swiggy, Blinkit, and Zepto. Their entire livelihood depends on outdoor work. When it rains heavily, AQI spikes, or a heatwave hits — orders stop, earnings collapse, and there is absolutely no safety net.

| What happens | The gap |
|---|---|
| Rain stops orders for 3 hours | No product covers **hourly** income loss |
| AQI crosses dangerous levels | Not recognised as an insurable event |
| Heatwave makes riding dangerous | No parametric trigger exists in any product |
| Worker needs money that same day | Traditional claims take weeks |
| Worker can't file paperwork | Existing insurance demands documentation |

> **There is no product in the Indian market that protects the daily earnings of gig workers from real-world disruptions on an hourly basis. Coveer is that product.**

---

## The Solution — Zero Claims. Just Pay.

Coveer is not traditional insurance. It is a **parametric income protection platform** built on one principle:

> *Measure impact. Pay automatically. Never ask the worker to prove anything.*

```
Worker signs up once (< 2 minutes)
          ↓
System monitors their city every hour
          ↓
Disruption threshold crossed → impact % calculated
          ↓
Wallet credited automatically — no action from worker
```

---

## How It Works — The Technical Reality

### 1 — Parametric Trigger System

Instead of claim-based verification, Coveer uses real-world data thresholds that trigger payouts automatically:

| Disruption | Threshold | Impact Level |
|---|---|---|
| Rainfall | > 2.5 mm/hr | 30% |
| Rainfall | > 7.5 mm/hr | 60% |
| Rainfall | > 15 mm/hr | 100% |
| Temperature | > 42°C | 50% |
| AQI | 201–300 | 30% |
| AQI | > 300 | 60% |
| Local Curfew | Authority signal | 100% |

**Payout Formula:**
```
hourlyIncome    = dailyEarnings ÷ 8
effectivePayout = hourlyIncome × (impactPercentage ÷ 100)
finalPayout     = min(effectivePayout, planMaxDailyPayout)
```

**Example — Real Worker Day in Mumbai:**
```
12:00 PM  Normal           →   0% impact   →  ₹0
01:00 PM  Light Rain       →  30% impact   →  ₹45  (₹150 × 0.30)
02:00 PM  Heavy Rain       →  60% impact   →  ₹90  (₹150 × 0.60)
03:00 PM  Heavy Rain       →  60% impact   →  ₹90  (₹150 × 0.60)
04:00 PM  Clearing         →   0% impact   →  ₹0
                                              ────
Total credited at 10 PM    →               ₹225
```

### 2 — Hourly Weather Caching Architecture

The most critical architectural decision in Coveer is how we handle weather data at scale.

**Wrong approach (what we didn't do):**
```
1,000 users open dashboard → 1,000 API calls to OpenWeatherMap → rate limit hit instantly
```

**Coveer's approach:**
```
Cron job runs every hour → 10 API calls (one per city) → stored in MongoDB
1,000 users open dashboard → 1,000 queries to MongoDB → instant response
```

This means external API usage stays flat at **10 calls/hour regardless of user count**, costs nothing extra at scale, and dashboards load in milliseconds.

**CityWeather collection** stores hourly snapshots with a 48-hour TTL index — auto-deleted by MongoDB, no cleanup needed.

### 3 — AI-Assisted Document Verification

The verification pipeline runs automatically the moment a worker submits documents:

```
Worker uploads Aadhaar + Platform Screenshot
                    ↓
Backend → ImageKit CDN (permanent storage, secure URLs)
                    ↓
Async call to Python ML Service (FastAPI on Hugging Face)
                    ↓
┌─────────────────────────────────────────────────────┐
│  1. ELA (Error Level Analysis) — tampering detection │
│  2. EasyOCR — text extraction from both documents    │
│  3. Fuzzy name match (threshold: 80%) — fuzzywuzzy   │
│  4. DOB cross-check — dateparser                     │
│  5. Platform keyword validation — "Partner/Active"   │
│  6. Weighted confidence score                        │
└─────────────────────────────────────────────────────┘
                    ↓
> 0.80 → Auto-verified instantly
0.60–0.80 → Flagged for admin manual review
< 0.60 → Auto-rejected with reason stored
```

**Why this matters for insurance:** Traditional KYC takes days. Coveer's pipeline completes in under 90 seconds.

### 4 — Dynamic Plan Pricing (Actuarial Logic)

Fixed premiums create adverse selection — high earners are overcharged, low earners are underserved. Coveer's plan pricing scales with declared daily earnings:

| Daily Earnings | Basic Price | Basic Max/day | Premium Price | Premium Max/day |
|---|---|---|---|---|
| ₹300 (min) | ₹20/week | ₹300 | ₹40/week | ₹600 |
| ₹1,150 (mid) | ₹25/week | ₹450 | ₹45/week | ₹800 |
| ₹2,000 (max) | ₹30/week | ₹600 | ₹50/week | ₹1,000 |

**Target loss ratio:** < 65% (premium collected vs payouts made). Higher-risk cities (Mumbai monsoon season) carry a risk multiplier on premium — lower-risk cities get reduced premiums. This is the same actuarial principle used by traditional insurers, applied dynamically.

### 5 — Fraud Defense Architecture

**The biggest structural advantage: no claim system.**

Traditional insurance fraud entry point is the claim itself — fabricated losses, exaggerated damages. Coveer eliminates this entirely. Workers never file anything. Payouts trigger from external data only.

**Additional defense layers:**

```
Layer 1 → No claim system (structural — no entry point)
Layer 2 → GPS verification (passive background checks)
Layer 3 → IP + GPS mismatch detection
Layer 4 → Behavioral anomaly detection (Isolation Forest)
Layer 5 → Cluster fraud detection (DBSCAN)
Layer 6 → Trust score system (0–100)
Layer 7 → Payout delay for flagged accounts
```

**Trust Score:**

| Score | Status | Payout Behaviour |
|---|---|---|
| 80–100 | High Trust | Instant |
| 60–79 | Medium Trust | 24-hour delay |
| 40–59 | Low Trust | 48-hour hold |
| < 40 | Flagged | Blocked + admin review |

### 6 — Wallet & Payment Architecture

All money flows through a single internal wallet per user. Razorpay is used only at entry and exit points:

```
MONEY IN:  Razorpay Checkout → verified → wallet.balance += amount
PLAN:      wallet.balance -= plan.weeklyPrice → planStatus: 'active'
PAYOUT:    Settlement engine → planStatus check → wallet.balance += payout
MONEY OUT: Razorpay Payout API → wallet.balance -= withdrawal
```

**Plan renewal logic (runs daily at 00:05):**
- `planExpiresAt <= now` AND `autoRenew: true` AND sufficient balance → auto-renew, extend 7 days
- Insufficient balance → `planStatus: 'inactive'` → excluded from next settlement run
- `autoRenew: false` → `planStatus: 'expired'`

**Settlement engine checks `planStatus === 'active'` before crediting any payout.** This single check ensures inactive users never receive payouts, and it runs as the final gate in the settlement cron.

---

## Coverage Exclusions (Insurance Domain)

Standard insurance exclusions that prevent moral hazard:

- First 2 hours each day (daily deductible equivalent)
- Voluntary offline — not caused by a monitored disruption
- Platform scheduled maintenance windows
- Operating outside registered city (GPS cross-check)
- Plan inactive, expired, or payment lapsed
- Trust score below 40 (fraud-flagged accounts)

---

## System Architecture

![System Flow](./Assets/SystemFlow.png)

### Cron Job Schedule

| Job | Runs At | Function |
|---|---|---|
| Weather Fetch | Every hour `:50` | Fetches OpenWeatherMap + AQI for 10 cities, stores snapshots, computes impact % |
| Settlement | Every hour `:55` | Reads unsettled `HourlyImpact` records, calculates payouts per active user, credits wallets |
| Plan Renewal | Daily `00:05` | Checks expired plans, auto-renews if balance sufficient, marks inactive if not |

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + Vite 8 | UI framework with fast HMR builds |
| React Router v7 | Client-side routing with protected routes |
| Axios + HTTP-only cookies | Secure API communication (no localStorage tokens) |
| Recharts | Admin dashboard data visualisation |
| Lucide React | Icon system |
| React Toastify | Non-blocking user notifications |
| Vercel Analytics | Production usage tracking |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose 9 | Document database with TTL indexes |
| JWT (dual-secret) | Separate JWT secrets for users and admins — `token` vs `adminToken` cookies |
| Multer + ImageKit.io | Document upload pipeline with CDN delivery |
| Node-cron | Scheduled jobs (weather fetch, settlement, renewal) |
| Razorpay | Payment processing — wallet top-up and UPI withdrawals |
| Axios | Internal calls to ML service |

### ML Service
| Technology | Purpose |
|---|---|
| Python + FastAPI | Async verification service |
| EasyOCR | Multilingual text extraction (English + Hindi for Aadhaar) |
| PIL/Pillow + ELA | Image tampering detection via compression analysis |
| fuzzywuzzy | Fuzzy name matching with configurable threshold |
| dateparser | DOB extraction from multiple date formats |
| Hugging Face Spaces (Docker) | Serverless GPU-optional deployment |

### External APIs
| API | Usage |
|---|---|
| OpenWeatherMap | Hourly rainfall (mm/hr), temperature, wind per city |
| OpenWeatherMap Air Pollution | PM2.5, AQI index per city coordinates |
| Razorpay | Payment orders, signature verification, UPI payouts |

---

## Project Structure

```
coveer/
├── frontend/
│   └── src/
│       ├── admin/              # Fully isolated admin system
│       │   ├── context/        # AdminAuthContext (separate from user auth)
│       │   ├── components/     # AdminSidebar, StatCard, DataTable, UserEditModal
│       │   ├── pages/          # Login, Dashboard, Users, Weather, Payouts
│       │   ├── api/            # adminApi.js (pre-configured axios instance)
│       │   └── styles/         # admin.css (same design system, admin variables)
│       ├── components/         # Navbar, Hero, HowItWorks, WhySection, PlatformStrip
│       ├── pages/              # Home, Auth, Start, Verify, Dashboard
│       └── context/            # AuthContext (user auth state)
│
├── backend/
│   └── src/
│       ├── controllers/
│       │   ├── admin/          # auth, users, weather, payouts, stats
│       │   └── ...             # user auth, verification, payment, weather
│       ├── models/             # User, Admin, CityWeather, HourlyImpact
│       ├── routes/
│       │   ├── admin/          # All admin routes under /admin/*
│       │   └── ...             # User-facing routes
│       ├── jobs/               # weatherCron, settlementCron, planRenewalCron
│       ├── services/           # wallet.service, weather.service
│       ├── middlewares/        # auth.middleware, adminAuth.middleware
│       └── scripts/            # createAdmin.js (one-time seed)
│
└── ml-service/
    ├── app.py                  # FastAPI entry point
    ├── Dockerfile              # Hugging Face Spaces deployment
    └── validators/
        ├── ela.py              # Error Level Analysis
        ├── ocr.py              # EasyOCR wrapper
        ├── document.py         # Aadhaar/PAN extraction + validation
        ├── platform.py         # Screenshot keyword validation
        └── name_match.py       # Fuzzy name comparison
```

---

## Deployment

### Backend — Render

1. Connect repo to Render, set **Root Directory** to `backend`
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. Add all environment variables (see below)
5. After first deploy, seed admin account:
```bash
node backend/src/scripts/createAdmin.js
```

### Frontend — Vercel

1. Import repo on Vercel, set **Root Directory** to `frontend`
2. **Framework:** Vite
3. Set environment variable: `VITE_API_URL` = your Render backend URL
4. Deploy — zero config needed

### ML Service — Hugging Face Spaces

1. Create a new Space, SDK: **Docker**
2. Push `ml-service/` contents to the Space repo
3. Dockerfile exposes port `7860` — Hugging Face manages the rest
4. Set `ML_SERVICE_URL` in backend env to the Space URL

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=3000
MONGODB_URI=your_mongodb_atlas_uri

# User auth
JWT_SECRET=your_user_jwt_secret

# Admin auth (separate secret — critical)
ADMIN_JWT_SECRET=your_admin_jwt_secret
ADMIN_EMAIL=admin@coveer.in
ADMIN_PASSWORD=your_secure_admin_password

# ImageKit (document storage)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id/

# Weather
OPENWEATHER_API_KEY=your_openweather_key

# Payments
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
RAZORPAY_ACCOUNT_NUMBER=your_account_number

# ML Service
ML_SERVICE_URL=https://your-hf-space.hf.space

NODE_ENV=production
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## User Journey

### Worker Onboarding (< 2 minutes)

```
Step 1 — Account
  Name · Email · Password · Date of Birth

Step 2 — Work Details
  Platform (Zomato/Swiggy/Blinkit/Zepto/Amazon/Flipkart)
  Primary city · Average daily earnings (₹300–₹2,000)

Step 3 — Plan Selection
  Basic or Premium — prices and max payouts update live
  based on declared daily earnings

→ Redirect to /verify
```

### Identity Verification

```
Upload Aadhaar/PAN + Platform partner app screenshot
→ ML service validates in < 90 seconds
→ Status: verified → Dashboard unlocked
→ Status: under_review → Admin manually reviews
→ Status: rejected → Reason shown, re-upload available
```

### Daily Worker Experience

```
Worker opens dashboard → sees live conditions for their city
Weather data loads from MongoDB (< 100ms — cached, not external API)
If affected: estimated payout shown
At 10 PM → settlement runs → wallet credited automatically
Worker withdraws via UPI at any time (min ₹10)
```

---

## Admin Capabilities

The admin panel (`/admin/*`) is completely isolated from the user-facing app — separate auth context, separate JWT secret, separate cookie name, separate middleware.

**Admin Dashboard:**
- Real-time overview: total users, active plans, today's payout total, cities currently affected
- User growth chart (30 days) — AreaChart with Recharts
- Payout trend chart (30 days) — BarChart with Recharts
- Hourly weather impact chart (24 hours) — LineChart with Recharts
- Today's payouts table — live, timestamped

**User Management:**
- Search by name/email, filter by plan/status/city/verification
- Edit: city, plan, plan status, daily earnings, auto-renew, trust score
- View verification documents (Aadhaar + platform screenshot thumbnails with full-size links)
- Manually override verification status + set rejection reason
- Full admin change log per user (field, old value, new value, timestamp, admin name)

**Weather Monitoring:**
- Live status cards for all 10 cities — green/red based on current impact
- Full hourly snapshot table with sort/filter
- Last fetch time per city + next scheduled fetch countdown

**Payout Management:**
- All-time, monthly, weekly payout stats
- Today's payouts highlighted with total amount
- Filter by date, city, plan

---

## Why Coveer Stands Out

| Dimension | Traditional Insurance | Coveer |
|---|---|---|
| Claim process | File paperwork, wait weeks | Zero claims — automatic |
| Coverage granularity | Daily / monthly | Hourly, percentage-based |
| Payout speed | 7–30 days | Same hour |
| Target segment | Formal sector | Gig workers, informal economy |
| Fraud prevention | Post-claim investigation | Structural — no claim possible |
| Premium model | Flat rate | Risk-adjusted by city + earnings |
| Distribution | Agent / broker network | Mobile-first, self-serve, < 2 min |
| Verification | Manual KYC, days | AI pipeline, < 90 seconds |

---

## What We Built vs What's Planned

### ✅ Built (MVP — This Submission)
- Full user onboarding — 3-step signup with dynamic plan pricing
- AI-assisted identity verification pipeline (OCR + ELA + fuzzy match)
- Hourly weather monitoring for 10 Indian cities (cached architecture)
- Parametric trigger system with percentage-based impact scoring
- Hourly settlement engine with planStatus gating
- Internal wallet system with Razorpay integration (top-up + withdrawal)
- Plan renewal cron with balance-based activation/deactivation
- Trust score system with payout delay tiers
- Full admin panel (auth, dashboard, user management, weather, payouts)
- Protected routes for both user and admin systems
- Push notifications for payout credits
- Dynamic risk-based premium pricing per city (actuarial model)

---

<div align="center">

**Built for India's 11 million gig workers.**

*No claims. No paperwork. Just protection.*

</div>