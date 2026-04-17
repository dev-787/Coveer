const mongoose = require("mongoose");

const PayoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date, // the settlement date (always 10PM that day)
      required: true,
    },

    totalAffectedHours: {
      type: Number, // e.g. 3
      required: true,
    },

    // Breakdown of affected hours by disruption type
    hoursBreakdown: [
      {
        type: { type: String }, // "rain", "heatwave", etc.
        hours: Number,
        impactPercent: Number,
      },
    ],

    hourlyIncome: {
      type: Number, // snapshot of user's hourly income at time of payout
      required: true,
    },

    grossPayout: {
      type: Number, // hourlyIncome * totalAffectedHours
      required: true,
    },

    planCap: {
      type: Number, // 600 for basic, 1000 for premium
      required: true,
    },

    finalPayout: {
      type: Number, // min(grossPayout, planCap)
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "credited", "held", "failed"],
      default: "pending",
    },

    heldReason: {
      type: String, // e.g. "low trust score", "fraud flag"
    },

    // Reference to the wallet transaction created
    walletTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WalletTransaction",
    },
  },
  { timestamps: true }
);

// One payout record per user per day
PayoutSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Payout", PayoutSchema);
