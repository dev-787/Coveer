const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ── Account ────────────────────────────────────────────────────────────────
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    fullName: {
      firstName: { type: String, required: true, trim: true },
      lastName:  { type: String, required: true, trim: true },
    },
    dob: {
      type: Date,
      required: true,
    },

    // ── Work details ───────────────────────────────────────────────────────────
    platform: {
      type: String,
      required: true,
      enum: ["swiggy", "zomato", "amazon", "blinkit", "flipkart", "zepto"],
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    dailyEarnings: {
      type: Number,
      required: true,
      min: 100,
    },

    // ── Plan ───────────────────────────────────────────────────────────────────
    plan: {
      type: String,
      required: true,
      enum: ["basic", "premium"],
      default: "premium",
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },

    // ── Verification ──────────────────────────────────────────────────────────
    verificationStatus: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending',
    },
    verificationDocuments: {
      identityProof: { type: String, default: null },
      platformProof: { type: String, default: null },
    },
    verificationSubmittedAt:  { type: Date,   default: null },
    verificationCompletedAt:  { type: Date,   default: null },
    verificationRejectionReason: { type: String, default: null },

    // ── Trust & fraud ──────────────────────────────────────────────────────────
    trustScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ── Derived field helper ───────────────────────────────────────────────────────
userSchema.virtual("fullNameString").get(function () {
  return `${this.fullName.firstName} ${this.fullName.lastName}`;
});

// ── Hourly income derived from dailyEarnings (assumes 8hr workday) ─────────────
userSchema.virtual("hourlyIncome").get(function () {
  return Math.round(this.dailyEarnings / 8);
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;