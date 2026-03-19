![Coveer Banner](./Assets/Cover.png)
# 🛡️ Coveer

***Insurance that works as fast as you do.***

---

## 📌 Problem Statement

India’s gig delivery workers (Zomato, Swiggy) depend on **daily earnings**.
However, external disruptions like **heavy rain, extreme heat, pollution, or curfews** can suddenly stop their work, causing immediate income loss.

Currently, there is **no system that protects their daily income** from such uncontrollable events.

---

## 💡 Solution Overview

**Coveer** is an **AI-assisted parametric insurance platform** that:

* Monitors real-world disruptions **hourly**
* Tracks **how long a worker is impacted**
* Calculates **actual income loss**
* Automatically processes **daily payouts (10 PM settlement)**

> **🎯 Key Idea:**
> We don’t verify claims — we **measure real impact and compensate automatically**.

---

## 👤 Target Persona

### Delivery Partner (Swiggy / Zomato)

* Age: 18–35
* Income Type: **Daily earnings (₹500–₹1500/day)**
* Work Nature: Outdoor, highly disruption-sensitive

### Pain Points

* Income stops during rain / heat / pollution
* No safety net for lost working hours
* Financial instability

---

## 🔄 Product Workflow

### 1. User Onboarding & Verification

* User signs up with:

  * Phone number (**OTP verification**)
  * Platform identity (**ID / screenshot / mock verification**)

- **AI-based Identity Validation**
  - Image validation model checks whether the uploaded ID/screenshot is genuine or manipulated  
  - Detects blurred, edited, or duplicate submissions  

- **Location Verification (at login)**
  - User is required to enable location access  
  - System verifies whether the user is actually operating in the selected city/zone  
  - Location consistency is tracked over time to prevent spoofing  


* **Minimal friction onboarding (under 2 minutes)** designed for gig workers

* System stores:

  * City / working zone
  * Average daily income
  * Subscription plan

---

### 2. Hourly Disruption Monitoring 🔥

System runs **every hour**:

* Weather API (rain, temperature)
* AQI API (pollution levels)
* Local disruption signals (mock)

Each hour is marked as:

```text
Affected → worker cannot operate normally  
Not Affected → normal working conditions  
```

---

### 3. User Impact Tracking

For each worker:

* System matches:

  * Worker location
  * Hourly disruption data

* Tracks:

```text
Total Affected Hours per Day
```

**Example:**

```text
2 PM → Heavy Rain → Affected  
3 PM → Heavy Rain → Affected  
4 PM → Normal → Not Affected  

Total Impact = 2 hours
```

---

### 4. 10 PM Daily Settlement Engine 💰

At **10 PM**, system performs:

* Fetch all active users
* Calculate total affected hours
* Compute payout
* Credit wallet instantly

---

## ⚡ Parametric Trigger System

Coveer uses **parametric triggers** to automate payouts.

* Real-world events (rain, heat, AQI) are continuously monitored
* When thresholds are met, the system:

  * Identifies affected zones
  * Matches users in those zones
  * Automatically initiates payouts

> No manual claim required — triggers are based purely on external data.

---

## 💰 Payout Model

### Formula

```text
Payout = Hourly Income × Affected Hours
```

### Example

```text
Hourly Income = ₹150  
Affected Hours = 3  

Payout = ₹450
```

---

### Plan Limits

| Plan    | Weekly Cost | Max Daily Payout |
| ------- | ----------- | ---------------- |
| Basic   | ₹25/week    | ₹600             |
| Premium | ₹40/week    | ₹1000            |

---

## 🤖 Role of AI (**Practical & Focused**)

We use AI where it actually adds value:

### 1. Risk-Based Premium Calculation

AI analyzes:

* City weather patterns
* Pollution trends
* Historical disruptions

**Output:**

```text
High Risk City → Higher Premium  
Low Risk City → Lower Premium  
```

---

### 2. Disruption Severity Modeling

Instead of binary triggers, Coveer uses **percentage-based impact modeling**:

```text
Light Rain → 30% impact (reduced delivery efficiency)  
Heavy Rain → 60% impact (major slowdown)  
Extreme Conditions → 100% impact (no deliveries possible)  
```

---

### 3. Fraud Detection (**Cluster-Based**)

AI detects:

* Repeated abnormal behavior
* Multiple users showing identical patterns
* Suspicious activity clusters

---

## 🚨 Market Crash: Adversarial Defense & Anti-Spoofing Strategy

### 🧨 Problem

Fraud rings exploit systems using:

* Fake GPS locations
* Coordinated claims
* Trigger manipulation

---

## 🛡️ Our Defense Approach

### 1. No Claim-Based System (**Biggest Defense**)

* Users **do not submit claims**
* System triggers payouts automatically

👉 Eliminates major fraud entry point

---

### 2. Multi-Layer Location Validation

We verify location using:

* GPS consistency
* IP location matching
* Historical movement patterns

---

### 3. Behavioral Analysis

System detects anomalies like:

* User always “affected” every day
* No movement during working hours
* Unrealistic activity patterns

---

### 4. Cluster Fraud Detection 🔥

We detect fraud rings using:

* Same location + same timing
* Similar behavior across users
* Pattern similarity

**Action:**

```text
→ Flag cluster  
→ Delay or block payouts  
```

---

### 5. Trust-Based Scoring

Each user has a **trust score**:

| Score Type | Action             |
| ---------- | ------------------ |
| High Trust | Instant payout     |
| Medium     | Light verification |
| Low        | Flag / delay       |

---

### 6. Fairness Mechanism

* First-time users are trusted
* Soft warnings before strict action
* Genuine users are not penalized

---

## 💳 Payout System

* Internal wallet system
* Instant credit at **10 PM**
* Transaction history tracking

### Withdrawal Flow

* Users can withdraw wallet balance via:

  * UPI
  * Bank transfer
  * **Razorpay** 

**Example:**

```text
+₹450 Rain Impact Payout  
-₹20 Weekly Premium  
+₹300 Heatwave Compensation  
```

---

## 📊 Dashboard (Planned)

### Worker Dashboard

* Active plan
* Wallet balance
* Earnings protected
* Daily impact summary

---

### Admin Dashboard

* Total users
* Active disruptions
* Fraud alerts
* Risk zones
* Loss ratios (premium vs payouts)
* Predicted high-risk zones (AI insights)

---

## 🧱 Tech Stack

**Frontend**

* React / Next.js

**Backend**

* Node.js + Express

**Database**

* MongoDB

**APIs**

* OpenWeather API
* AQI API
* Mock disruption APIs

**AI Layer**

* Python / ML models (risk + fraud detection)

---

## 🎯 Why Coveer Stands Out

* Realistic, scalable solution
* Accurate **time-based compensation**
* No manual claim dependency
* Strong fraud resistance
* Designed for real-world deployment

---

## 🚀 Conclusion

**Coveer** transforms insurance from a **claim-based system** into a **real-time income protection engine**.

It ensures that gig workers are **financially secure**, even when the world around them is unpredictable.
