const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    platform: {
      type: String,
      enum: ["zomato", "swiggy", "other"],
      required: true,
    },

    platformPartnerId: {
      type: String, // extracted via OCR from ID screenshot
      trim: true,
    },

    city: {
      type: String,
      required: true,
    },

    zone: {
      type: String, // e.g. "Andheri East", "Koramangala"
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    avgDailyIncome: {
      type: Number, // in INR, e.g. 800
      required: true,
    },

    hourlyIncome: {
      type: Number, // avgDailyIncome / 8
    },

    plan: {
      type: String,
      enum: ["basic", "premium"],
      default: "basic",
    },

    planStartDate: {
      type: Date,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    trustScore: {
      type: Number,
      default: 100, // 0–100; high = instant payout, low = flagged
      min: 0,
      max: 100,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    idImageUrl: {
      type: String, // URL to uploaded ID/screenshot in storage
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Geo index for location-based zone matching
UserSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", UserSchema);
