![Coveer Banner](./Assets/Cover.png)
# 🛡️ Coveer
### *Insurance that works as fast as you do.*

> **Coveer** is an AI-assisted parametric insurance platform that automatically protects the daily income of gig delivery workers from weather, AQI, and real-world disruptions — with zero claims, zero paperwork, and daily payouts at 10 PM.

---

## 📌 Problem Statement

India has **11+ million gig delivery workers** (Zomato, Swiggy, Blinkit, Zepto) whose entire livelihood depends on daily outdoor work. These workers earn between ₹500–₹1,500/day with **no safety net** when disruptions beyond their control make delivery impossible.

### The Gap Traditional Insurance Fails to Address

| Problem | Why Traditional Insurance Fails |
|---|---|
| Rain stops orders for 3 hours | No product covers hourly income loss |
| AQI crosses dangerous threshold | Not recognised as an insurable event |
| Heatwave makes riding dangerous | No parametric trigger exists |
| Worker needs money same day | Claim settlement takes weeks |
| Worker can't file paperwork | Complex claim forms require documentation |

> **There is no product in the Indian market that protects the daily earnings of gig workers from real-world disruptions on an hourly basis.**

---

## 💡 Solution — What Coveer Does Differently

Coveer is **not** a traditional insurance product. It is a **parametric income protection platform** built on three core principles:

**1. Measure, Don't Verify** — Instead of asking workers to prove loss, we measure it using real-world data (weather APIs, AQI APIs, disruption signals).

**2. Hourly Granularity** — Disruptions are tracked every hour. Workers are compensated for the exact hours they were impacted, not approximated.

**3. Zero-Touch Settlement** — No claims. No calls. No paperwork. The system runs automatically at 10 PM every day and credits the wallet directly.

---

## 👤 Target Persona — Deep Segment Understanding

### Primary User: Urban Gig Delivery Partner

| Attribute | Detail |
|---|---|
| Age | 18–45 years |
| Platform | Zomato / Swiggy / Blinkit / Zepto / Amazon / Flipkart |
| Daily Income | ₹500–₹1,500/day (₹150–₹190/hour approx.) |
| Work Nature | Outdoor, weather-dependent, no fixed hours |
| Device | Android smartphone, low-to-mid range |
| Payment Preference | UPI-first (PhonePe, GPay) |
| Language | Hindi + Regional, limited English comfort |
| Trust Barriers | Suspicious of insurance, fears hidden charges |
| Key Motivation | Stable daily income, family support |

### Segment-Specific Pain Points We Address

**Financial Instability** — A worker losing 4 hours to heavy rain loses ~₹600 that day with no recovery. Coveer replaces that loss automatically.

**No Traditional Coverage** — Health insurance, vehicle insurance, and term life insurance exist but nothing covers *daily income loss from weather*.

**Behavioural Barrier** — Traditional insurance requires claim filing. A delivery worker finishing a 12-hour shift will not file paperwork. Coveer requires zero action post-signup.

**Trust Gap** — Workers don't trust that insurance will actually pay. Coveer's wallet model — where money visibly appears at 10 PM — builds trust through repeated, tangible proof.

---

## 🏗️ Product Architecture & Workflow

### Phase 1 — User Onboarding

```
User Downloads App / Visits Web
          ↓
Step 1: Account Creation (< 2 minutes)
  • Email + Password
  • Full name + Date of birth
  • Delivery platform selection
  • Primary city
  • Average daily earnings (used for payout calc)
          ↓
Step 2: Plan Selection
  • Basic Plan — ₹25/week — Max ₹600/day payout
  • Premium Plan — ₹40/week — Max ₹1,000/day payout
  • Auto-renew toggle
  • T&C acceptance
          ↓
Step 3: Identity Verification (AI-Assisted)
  • Upload: Aadhaar / PAN card (identity proof)
  • Upload: Platform partner app screenshot (work proof)
  • AI validates: Real vs fake document detection (ELA tampering analysis)
  • AI validates: OCR extraction → Name + DOB match against profile
  • AI validates: Platform keywords present in screenshot
  • Status: under_review → verified (auto) / manual_review (low confidence)
          ↓
Step 4: GPS Location Verification
  • One-time location permission request
  • System cross-checks GPS coordinates against registered city
  • Background periodic checks for fraud prevention
          ↓
Dashboard Unlocked — Coverage Active
```

### Phase 2 — Hourly Disruption Monitoring (Always Running)

```
Every Hour (Cron Job):
          ↓
┌─────────────────────────────────────────────┐
│  Data Sources Queried:                       │
│  • OpenWeatherMap API → rainfall mm/hr, temp │
│  • AQI API → PM2.5, PM10, AQI index         │
│  • Local disruption signals (mock → real)    │
└─────────────────────────────────────────────┘
          ↓
AI Severity Model (XGBoost) Runs:
  Input: rainfall intensity + temperature + AQI + time + city
  Output: Impact Percentage (0% → 100%)

  Light Rain      → 30% impact
  Heavy Rain      → 60% impact
  Extreme Weather → 100% impact
  AQI > 300       → 40% impact
  Heatwave > 42°C → 50% impact
          ↓
Each city-zone tagged: AFFECTED (%) or NOT AFFECTED
```

### Phase 3 — Per-Worker Impact Tracking

```
For Each Active User:
          ↓
Match: Worker's registered city/zone ↔ Disruption data
          ↓
If zone is AFFECTED:
  Record: timestamp, impact_percentage, disruption_type
  Accumulate: daily_affected_hours[]
          ↓
Running daily total maintained per user
```

**Example — Real Worker Day:**

```
12:00 PM  →  Normal         →  0% impact   →  Not counted
1:00 PM   →  Light Rain     →  30% impact  →  0.3 hrs counted
2:00 PM   →  Heavy Rain     →  60% impact  →  0.6 hrs counted
3:00 PM   →  Heavy Rain     →  60% impact  →  0.6 hrs counted
4:00 PM   →  Clearing       →  10% impact  →  0.1 hrs counted
5:00 PM   →  Normal         →  0% impact   →  Not counted

Total Effective Affected Hours = 1.6 hours
Hourly Income = ₹150
Payout = 1.6 × ₹150 = ₹240 (capped at plan max)
```

### Phase 4 — 10 PM Daily Settlement Engine

```
Every day at 10:00 PM (Cron Job):
          ↓
Fetch all users where:
  • verificationStatus = 'verified'
  • plan is active (premium not expired)
  • daily_affected_hours > 0
          ↓
For each user:
  1. Calculate: hourlyIncome = dailyEarnings / 8
  2. Calculate: rawPayout = hourlyIncome × affectedHours
  3. Apply: plan cap (Basic: ₹600, Premium: ₹1,000)
  4. Apply: trust score modifier (flagged users → delayed)
  5. Credit: wallet.balance += finalPayout
  6. Log: transaction { type: 'payout', amount, disruption, hours }
  7. Reset: daily_affected_hours = []
          ↓
Worker sees +₹240 in wallet at 10 PM
No action required. No claim filed.
```

---

## ⚡ Parametric Trigger System — Insurance Domain Logic

### What Makes This Parametric Insurance

Traditional insurance: **Loss occurs → Worker files claim → Insurer investigates → Settlement (weeks)**

Parametric insurance: **Pre-defined trigger threshold crossed → Automatic payout → No investigation needed**

Coveer's parametric triggers are defined as:

| Disruption Type | Trigger Threshold | Impact Level |
|---|---|---|
| Rainfall | > 2.5 mm/hr | Light (30%) |
| Rainfall | > 7.5 mm/hr | Heavy (60%) |
| Rainfall | > 15 mm/hr | Extreme (100%) |
| Temperature | > 42°C | Severe Heat (50%) |
| AQI | 201–300 | Unhealthy (30%) |
| AQI | > 300 | Hazardous (60%) |
| Local Curfew | Authority signal | Extreme (100%) |

### Coverage Exclusions (Insurance Domain Fundamentals)

The following are explicitly **excluded** from payout calculation:

- **Scheduled maintenance** — Platform downtime not caused by weather
- **Worker voluntary offline** — Worker goes offline not due to disruption
- **Fraud-flagged sessions** — Trust score below threshold
- **Non-registered zones** — Worker operating outside their registered city
- **Premium lapse** — Coverage paused if weekly premium not renewed
- **First 2 hours each day** — Deductible equivalent (reduces moral hazard)
- **Payout cap enforcement** — Basic: ₹600/day, Premium: ₹1,000/day regardless of hours

### Actuarial Thinking — Loss Ratio Management

```
Revenue per worker per week:
  Basic:   ₹25/week = ₹100/month
  Premium: ₹40/week = ₹160/month

Expected payout per worker per month (Mumbai):
  Average disrupted hours/month: ~18 hours
  Average hourly income: ₹150
  Expected raw payout: ₹2,700/month
  After cap enforcement (avg): ~₹480/month

Target Loss Ratio: < 65% (premium collected vs payouts made)
Safety mechanism: AI risk-based premium adjusts per city
  High-risk city (Mumbai monsoon) → Premium scales up
  Low-risk city (Jaipur summer)   → Premium stays flat
```

---

## 🤖 AI/ML Strategy — Technical Depth

### Model 1: Document Verification (Identity Validation)

**Pipeline:**
```
Image Upload → EasyOCR (text extraction) → Keyword validation
            → ELA (Error Level Analysis) for tampering detection
            → Fuzzy name match (fuzzywuzzy, threshold: 80%)
            → DOB match (dateparser)
            → Confidence score → auto-approve / manual_review / reject
```

**Accuracy targets:**
- Document type detection: ~95%
- Name match (clean scan): ~85%
- Tampering detection: ~75%
- Confidence threshold: > 0.80 → auto-approve, 0.60–0.80 → manual review, < 0.60 → reject

### Model 2: Disruption Severity (Impact Scoring)

**Model:** XGBoost Gradient Boosting (tabular weather data)

**Features:**
- Rainfall intensity (mm/hr)
- Temperature (°C)
- AQI PM2.5 index
- Time of day (peak hours weighted higher)
- City historical baseline
- Day of week

**Output:** Impact percentage (0.0 → 1.0) per city-zone per hour

**Why XGBoost:** Fast inference (< 50ms), handles tabular data well, works on small datasets, easily retrained as real payout data accumulates

### Model 3: Fraud Detection

**Layer 1 — Rule-Based (runs first, cheapest):**
- Worker always affected every single day → flag
- No GPS movement during working hours → flag
- Same device ID, multiple accounts → block
- Payout claimed same hour as registration → flag

**Layer 2 — Isolation Forest (anomaly detection):**
- Unsupervised — no labelled fraud data needed to start
- Learns what "normal" behavior looks like across all users
- Flags statistical outliers for manual review

**Layer 3 — DBSCAN Clustering (fraud ring detection):**
- Groups users by GPS coordinates + claim timing + behavior
- If N users in same location all claim affected on same hours → fraud ring suspected
- Action: delay payouts, escalate to manual review

### Model 4: Risk-Based Premium Pricing

**Method:** Historical weather data + city disruption frequency → city risk score → premium multiplier

```
Mumbai (monsoon city)  → risk score: 0.82 → 1.3× base premium
Bengaluru (moderate)   → risk score: 0.55 → 1.0× base premium
Jaipur (low rain)      → risk score: 0.28 → 0.85× base premium
```

---

## 🛡️ Anti-Fraud Architecture

### Why This System is Structurally Fraud-Resistant

**The biggest fraud vector in traditional insurance is the claim itself.** When workers file claims, bad actors can fabricate claims. Coveer eliminates this entirely — workers never file anything. Payouts are triggered purely by external data.

### Multi-Layer Defense Stack

```
Layer 1 → No claim system (structural defense)
Layer 2 → GPS verification (passive, background)
Layer 3 → IP + GPS mismatch detection
Layer 4 → Behavioral anomaly (Isolation Forest)
Layer 5 → Cluster detection (DBSCAN)
Layer 6 → Trust score system
Layer 7 → Payout delay for flagged users
```

### Trust Score System

Every user starts at score 100. Score modifies payout behaviour:

| Score Range | Status | Action |
|---|---|---|
| 80–100 | High Trust | Instant payout at 10 PM |
| 60–79 | Medium Trust | 24-hour delay, light review |
| 40–59 | Low Trust | 48-hour hold, manual flag |
| < 40 | Flagged | Payouts blocked, account review |

**Fairness guarantee:** First-time users are always trusted (score 100). Score only decreases with repeated anomalies. Genuine users are never penalised for one irregular day.

---

## 💰 Payout & Wallet System

### Payout Formula

```
Effective Hours = Σ (impact_percentage × 1 hour) for each affected hour
Payout = Effective Hours × Hourly Income
Final Payout = MIN(Payout, Plan Daily Cap)
```

### Wallet Architecture

```
Worker Wallet:
  balance: ₹1,250
  transactions: [
    { type: 'payout',   amount: +₹450, reason: 'Heavy Rain 3hrs', date: '2024-03-15' }
    { type: 'premium',  amount: -₹25,  reason: 'Basic Plan Week 12', date: '2024-03-14' }
    { type: 'payout',   amount: +₹300, reason: 'Heatwave 2hrs',   date: '2024-03-13' }
    { type: 'withdrawal', amount: -₹500, method: 'UPI', date: '2024-03-12' }
  ]
```

### Withdrawal Flow

Worker-initiated. No minimum payout period. Options:
- **UPI** (primary — instant, preferred by target segment)
- **Bank Transfer** (2–4 hours, IMPS)
- **Payment Gateway** — Razorpay integration

---

## 🧱 Tech Stack

### Frontend
- **React.js + Vite** — Fast builds, component-based
- **React Router** — Client-side routing
- **Axios** — API calls with cookie-based auth
- **Lucide React** — Icon system

### Backend
- **Node.js + Express.js** — REST API server
- **MongoDB + Mongoose** — Document database, flexible schema
- **JWT + HTTP-only cookies** — Secure authentication
- **Multer + ImageKit.io** — Document upload and cloud storage
- **Node-cron** — Scheduled jobs (hourly monitoring, 10 PM settlement)

### AI/ML Layer
- **Python + FastAPI** — ML microservice
- **EasyOCR** — Document text extraction
- **XGBoost** — Disruption severity model
- **scikit-learn** — Isolation Forest fraud detection
- **fuzzywuzzy** — Fuzzy name matching
- **PIL/Pillow** — ELA image tampering detection

### External APIs
- **OpenWeatherMap API** — Hourly weather data
- **AQI API** — Pollution monitoring
- **Razorpay** — Payment processing

### Cloud & Storage
- **ImageKit.io** — Verification document storage (CDN-backed, secure)

---

## 📊 Dashboard Architecture

### Worker Dashboard (MVP Scope)

```
Home Screen:
  ┌─────────────────────────────────────────────┐
  │  Good evening, Rahul                         │
  │  Today's Status: 🔴 Affected (2.3 hrs so far)│
  │  Estimated payout: ₹345                      │
  └─────────────────────────────────────────────┘

  Wallet Card:
  ┌─────────────────────────────────────────────┐
  │  Balance: ₹1,250          [Withdraw]         │
  │  Last payout: +₹450 · Rain · Yesterday       │
  └─────────────────────────────────────────────┘

  This Week (last 7 days):
  Mon  Heavy Rain   +₹600
  Tue  Normal       —
  Wed  AQI High     +₹180
  Thu  Normal       —
  Fri  Storm        +₹450
```

### Admin Dashboard

- Total active users + verification queue
- Live disruption map by city
- Fraud alert feed (Isolation Forest triggers)
- Loss ratio monitor (premium collected vs payouts made)
- Risk zone predictions (next 48 hours)
- Manual verification review queue

---

## 🚀 Why Coveer Stands Out

| Dimension | Traditional Insurance | Coveer |
|---|---|---|
| Claim process | File paperwork, wait weeks | Zero claims, automatic |
| Coverage granularity | Daily/monthly | Hourly, percentage-based |
| Payout speed | 7–30 days | Same day, 10 PM |
| Target segment | Formal sector employees | Gig workers, informal economy |
| Fraud prevention | Investigation after claim | Structural — no claim possible |
| Premium | High (actuarial tables) | ₹25–₹40/week, risk-adjusted by city |
| Distribution | Agent / broker | Mobile-first, self-serve |

---

## 🔮 Roadmap

### Phase 1 — MVP (Current)
- ✅ User registration + 3-step onboarding
- ✅ AI document verification pipeline
- ✅ Hourly disruption monitoring (weather + AQI)
- ✅ Daily settlement engine
- ✅ Wallet + transaction history
- ✅ Basic fraud detection (rule-based)

### Phase 2 — Hardening
- 🔲 GPS-based location verification (background)
- 🔲 XGBoost severity model (trained on real data)
- 🔲 Isolation Forest fraud detection (deployed)
- 🔲 UPI withdrawal integration (Razorpay)
- 🔲 Push notifications (payout alerts)
- 🔲 Admin dashboard with fraud alerts

---

## 📐 System Flow Diagram

![Coveer Banner](./Assets/SystemFlow.png)