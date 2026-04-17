# Coveer — MongoDB Schemas & Seed Data

This folder contains all Mongoose schema definitions and seed data for the Coveer database.
The backend logic (auth, verification routes) is handled separately.

---

## Collections Overview

| File | Collection | Purpose |
|------|-----------|---------|
| `models/User.js` | `users` | Gig worker profile, plan, city, wallet, trust score |
| `models/Disruption.js` | `disruptions` | Hourly weather/AQI events per city/zone |
| `models/ImpactLog.js` | `impactlogs` | Per-user per-hour affected log (feeds settlement engine) |
| `models/Payout.js` | `payouts` | Daily 10PM settlement records |
| `models/WalletTransaction.js` | `wallettransactions` | Every credit/debit in the user's wallet |
| `models/FraudFlag.js` | `fraudflags` | Anomaly and cluster fraud alerts |

---

## Using with MongoDB Compass (GUI)

### Option A — Run the seed script (recommended)

1. Make sure MongoDB is running locally or you have an Atlas URI
2. From the `backend/` folder:

```bash
npm install mongoose
MONGO_URI=mongodb://localhost:27017/coveer_db node seed/seedData.js
```

3. Open **MongoDB Compass** → connect to `mongodb://localhost:27017`
4. You'll see `coveer_db` with all 6 collections populated with sample data

---

### Option B — Manual import in Compass

1. Open Compass → create database `coveer_db`
2. For each collection, click **ADD DATA → Insert Document**
3. Paste the relevant documents from `seed/seedData.js`

---

## Connecting from Backend (captain's code)

```js
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coveer_db');

// Import models wherever needed
const User = require('./models/User');
const Disruption = require('./models/Disruption');
const ImpactLog = require('./models/ImpactLog');
const Payout = require('./models/Payout');
const WalletTransaction = require('./models/WalletTransaction');
const FraudFlag = require('./models/FraudFlag');
```

---

## Notes

- `User.location` uses a `2dsphere` index for geo-based zone matching
- `ImpactLog` has a unique index on `{ user, hour }` — no duplicate logs per hour
- `Payout` has a unique index on `{ user, date }` — one settlement per user per day
- Trust score range: 0–100. Below ~50 triggers payout hold (captain to define threshold in business logic)
