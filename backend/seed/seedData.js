/**
 * COVEER — MongoDB Seed Data
 * ─────────────────────────────────────────────────
 * HOW TO USE IN MONGODB COMPASS:
 *
 * 1. Open MongoDB Compass → connect to your MongoDB URI
 * 2. Create a database called: coveer_db
 * 3. For each collection below:
 *    → Click "+" next to the database name
 *    → Name the collection (e.g. "users")
 *    → Click "ADD DATA" → "Insert Document"
 *    → Paste the array of documents for that collection
 *
 * OR run this file directly with Node.js:
 *    node seed/seedData.js
 * ─────────────────────────────────────────────────
 */

const mongoose = require("mongoose");

const User = require("../models/User");
const Disruption = require("../models/Disruption");
const ImpactLog = require("../models/ImpactLog");
const Payout = require("../models/Payout");
const WalletTransaction = require("../models/WalletTransaction");
const FraudFlag = require("../models/FraudFlag");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/coveer_db";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", MONGO_URI);

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Disruption.deleteMany({}),
    ImpactLog.deleteMany({}),
    Payout.deleteMany({}),
    WalletTransaction.deleteMany({}),
    FraudFlag.deleteMany({}),
  ]);
  console.log("Cleared existing collections.");

  // ─── USERS ────────────────────────────────────────
  const users = await User.insertMany([
    {
      phone: "9876543210",
      name: "Rajan Mehta",
      platform: "zomato",
      platformPartnerId: "ZMT-MH-00421",
      city: "Mumbai",
      zone: "Andheri East",
      location: { type: "Point", coordinates: [72.8691, 19.1136] },
      avgDailyIncome: 900,
      hourlyIncome: 112,
      plan: "premium",
      planStartDate: new Date("2024-06-01"),
      walletBalance: 1240,
      trustScore: 94,
      isVerified: true,
      verificationStatus: "approved",
      idImageUrl: "https://storage.coveer.in/ids/rajan_mehta.jpg",
    },
    {
      phone: "9812345678",
      name: "Suresh Kumar",
      platform: "swiggy",
      platformPartnerId: "SWG-BLR-01183",
      city: "Bangalore",
      zone: "Koramangala",
      location: { type: "Point", coordinates: [77.6241, 12.9352] },
      avgDailyIncome: 750,
      hourlyIncome: 93,
      plan: "basic",
      planStartDate: new Date("2024-06-05"),
      walletBalance: 340,
      trustScore: 88,
      isVerified: true,
      verificationStatus: "approved",
      idImageUrl: "https://storage.coveer.in/ids/suresh_kumar.jpg",
    },
    {
      phone: "9765432109",
      name: "Priya Sharma",
      platform: "zomato",
      platformPartnerId: "ZMT-DL-00897",
      city: "Delhi",
      zone: "Connaught Place",
      location: { type: "Point", coordinates: [77.2167, 28.6328] },
      avgDailyIncome: 1100,
      hourlyIncome: 137,
      plan: "premium",
      planStartDate: new Date("2024-05-20"),
      walletBalance: 2100,
      trustScore: 97,
      isVerified: true,
      verificationStatus: "approved",
      idImageUrl: "https://storage.coveer.in/ids/priya_sharma.jpg",
    },
    {
      // Suspicious user — low trust score, fraud flag pending
      phone: "9900112233",
      name: "Amit Patel",
      platform: "swiggy",
      platformPartnerId: "SWG-MH-04421",
      city: "Mumbai",
      zone: "Andheri East",
      location: { type: "Point", coordinates: [72.8691, 19.1136] },
      avgDailyIncome: 800,
      hourlyIncome: 100,
      plan: "basic",
      planStartDate: new Date("2024-06-10"),
      walletBalance: 0,
      trustScore: 38,
      isVerified: true,
      verificationStatus: "approved",
      idImageUrl: "https://storage.coveer.in/ids/amit_patel.jpg",
    },
  ]);
  console.log(`Inserted ${users.length} users.`);

  // ─── DISRUPTIONS ──────────────────────────────────
  const disruptions = await Disruption.insertMany([
    {
      city: "Mumbai",
      zone: "Andheri East",
      hour: new Date("2024-06-15T14:00:00.000Z"),
      type: "rain",
      rawData: { rainfall_mm: 42, temperature_c: 27, wind_speed_kmh: 18 },
      impactPercent: 60,
      severity: "heavy",
    },
    {
      city: "Mumbai",
      zone: "Andheri East",
      hour: new Date("2024-06-15T15:00:00.000Z"),
      type: "rain",
      rawData: { rainfall_mm: 55, temperature_c: 26, wind_speed_kmh: 22 },
      impactPercent: 60,
      severity: "heavy",
    },
    {
      city: "Mumbai",
      zone: "Andheri East",
      hour: new Date("2024-06-15T16:00:00.000Z"),
      type: "rain",
      rawData: { rainfall_mm: 12, temperature_c: 28, wind_speed_kmh: 10 },
      impactPercent: 30,
      severity: "light",
    },
    {
      city: "Delhi",
      zone: null, // entire city
      hour: new Date("2024-06-15T11:00:00.000Z"),
      type: "heatwave",
      rawData: { temperature_c: 47, aqi_value: 180, wind_speed_kmh: 6 },
      impactPercent: 100,
      severity: "extreme",
    },
    {
      city: "Bangalore",
      zone: "Koramangala",
      hour: new Date("2024-06-15T09:00:00.000Z"),
      type: "aqi",
      rawData: { aqi_value: 220, temperature_c: 32 },
      impactPercent: 30,
      severity: "light",
    },
  ]);
  console.log(`Inserted ${disruptions.length} disruptions.`);

  // ─── IMPACT LOGS ──────────────────────────────────
  // Rajan (Mumbai, premium) — 3 hours affected on 15 Jun
  const impactLogs = await ImpactLog.insertMany([
    {
      user: users[0]._id,
      disruption: disruptions[0]._id,
      date: new Date("2024-06-15"),
      hour: new Date("2024-06-15T14:00:00.000Z"),
      impactPercent: 60,
      hourlyPayout: Math.round(users[0].hourlyIncome * 0.6), // ₹67
      settled: true,
    },
    {
      user: users[0]._id,
      disruption: disruptions[1]._id,
      date: new Date("2024-06-15"),
      hour: new Date("2024-06-15T15:00:00.000Z"),
      impactPercent: 60,
      hourlyPayout: Math.round(users[0].hourlyIncome * 0.6),
      settled: true,
    },
    {
      user: users[0]._id,
      disruption: disruptions[2]._id,
      date: new Date("2024-06-15"),
      hour: new Date("2024-06-15T16:00:00.000Z"),
      impactPercent: 30,
      hourlyPayout: Math.round(users[0].hourlyIncome * 0.3), // ₹33
      settled: true,
    },
    // Priya (Delhi, premium) — 1 hour extreme heat
    {
      user: users[2]._id,
      disruption: disruptions[3]._id,
      date: new Date("2024-06-15"),
      hour: new Date("2024-06-15T11:00:00.000Z"),
      impactPercent: 100,
      hourlyPayout: users[2].hourlyIncome, // ₹137
      settled: true,
    },
    // Suresh (Bangalore, basic) — 1 hour light AQI
    {
      user: users[1]._id,
      disruption: disruptions[4]._id,
      date: new Date("2024-06-15"),
      hour: new Date("2024-06-15T09:00:00.000Z"),
      impactPercent: 30,
      hourlyPayout: Math.round(users[1].hourlyIncome * 0.3), // ₹27
      settled: true,
    },
  ]);
  console.log(`Inserted ${impactLogs.length} impact logs.`);

  // ─── PAYOUTS ──────────────────────────────────────
  const payouts = await Payout.insertMany([
    {
      user: users[0]._id, // Rajan
      date: new Date("2024-06-15T16:30:00.000Z"), // 10PM IST
      totalAffectedHours: 3,
      hoursBreakdown: [{ type: "rain", hours: 3, impactPercent: 60 }],
      hourlyIncome: users[0].hourlyIncome,
      grossPayout: 67 + 67 + 33, // ₹167
      planCap: 1000,
      finalPayout: 167,
      status: "credited",
    },
    {
      user: users[2]._id, // Priya
      date: new Date("2024-06-15T16:30:00.000Z"),
      totalAffectedHours: 1,
      hoursBreakdown: [{ type: "heatwave", hours: 1, impactPercent: 100 }],
      hourlyIncome: users[2].hourlyIncome,
      grossPayout: 137,
      planCap: 1000,
      finalPayout: 137,
      status: "credited",
    },
    {
      user: users[1]._id, // Suresh
      date: new Date("2024-06-15T16:30:00.000Z"),
      totalAffectedHours: 1,
      hoursBreakdown: [{ type: "aqi", hours: 1, impactPercent: 30 }],
      hourlyIncome: users[1].hourlyIncome,
      grossPayout: 27,
      planCap: 600,
      finalPayout: 27,
      status: "credited",
    },
    {
      user: users[3]._id, // Amit — payout held (low trust score)
      date: new Date("2024-06-15T16:30:00.000Z"),
      totalAffectedHours: 3,
      hoursBreakdown: [{ type: "rain", hours: 3, impactPercent: 60 }],
      hourlyIncome: users[3].hourlyIncome,
      grossPayout: 180,
      planCap: 600,
      finalPayout: 180,
      status: "held",
      heldReason: "low trust score — pending fraud review",
    },
  ]);
  console.log(`Inserted ${payouts.length} payouts.`);

  // ─── WALLET TRANSACTIONS ──────────────────────────
  await WalletTransaction.insertMany([
    {
      user: users[0]._id,
      type: "credit",
      category: "payout",
      amount: 167,
      balanceBefore: 1073,
      balanceAfter: 1240,
      description: "Rain Impact Payout — 15 Jun",
      linkedPayout: payouts[0]._id,
      status: "success",
    },
    {
      user: users[0]._id,
      type: "debit",
      category: "premium_deduction",
      amount: 40,
      balanceBefore: 1280,
      balanceAfter: 1240,
      description: "Weekly Premium — Premium Plan",
      status: "success",
    },
    {
      user: users[2]._id,
      type: "credit",
      category: "payout",
      amount: 137,
      balanceBefore: 1963,
      balanceAfter: 2100,
      description: "Heatwave Compensation — 15 Jun",
      linkedPayout: payouts[1]._id,
      status: "success",
    },
    {
      user: users[1]._id,
      type: "credit",
      category: "payout",
      amount: 27,
      balanceBefore: 313,
      balanceAfter: 340,
      description: "AQI Impact Payout — 15 Jun",
      linkedPayout: payouts[2]._id,
      status: "success",
    },
    {
      user: users[1]._id,
      type: "debit",
      category: "premium_deduction",
      amount: 25,
      balanceBefore: 338,
      balanceAfter: 313,
      description: "Weekly Premium — Basic Plan",
      status: "success",
    },
  ]);
  console.log("Inserted wallet transactions.");

  // ─── FRAUD FLAGS ──────────────────────────────────
  await FraudFlag.insertMany([
    {
      user: users[3]._id, // Amit
      flagType: "always_affected",
      severity: "medium",
      description: "User has been marked affected every single day for 7 consecutive days. Statistically abnormal compared to users in same zone.",
      evidence: new Map([
        ["consecutive_affected_days", 7],
        ["zone", "Andheri East"],
        ["avg_zone_affected_days", 2.3],
      ]),
      action: "payout_delayed",
      status: "open",
    },
    {
      user: users[3]._id,
      flagType: "ip_location_mismatch",
      severity: "high",
      description: "GPS shows Andheri East (Mumbai) but IP resolves to Pune. Possible VPN or GPS spoofing.",
      evidence: new Map([
        ["gps_city", "Mumbai"],
        ["ip_city", "Pune"],
        ["ip_address", "103.xx.xx.xx"],
      ]),
      action: "payout_blocked",
      status: "open",
    },
  ]);
  console.log("Inserted fraud flags.");

  console.log("\n✅ Seed complete! Collections ready in coveer_db:");
  console.log("   → users");
  console.log("   → disruptions");
  console.log("   → impactlogs");
  console.log("   → payouts");
  console.log("   → wallettransactions");
  console.log("   → fraudflags");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
