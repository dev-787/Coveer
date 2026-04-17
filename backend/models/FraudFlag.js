const mongoose = require("mongoose");

const FraudFlagSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    flagType: {
      type: String,
      enum: [
        "gps_spoofing",         // mock location detected
        "ip_location_mismatch", // IP city ≠ GPS city
        "no_movement",          // zero movement during working hours
        "always_affected",      // hit 100% impact every day for N days
        "cluster_fraud",        // part of a coordinated fraud ring
        "abnormal_pattern",     // Isolation Forest / Autoencoder outlier
      ],
      required: true,
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    description: {
      type: String, // human readable detail for admin dashboard
    },

    // For cluster fraud — IDs of other users in the same ring
    clusterUserIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Supporting evidence stored as key-value
    evidence: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      // e.g. { "gps_coords": [72.8, 19.0], "ip_city": "Delhi", "gps_city": "Mumbai" }
    },

    action: {
      type: String,
      enum: ["none", "soft_warning", "payout_delayed", "payout_blocked", "account_suspended"],
      default: "none",
    },

    resolvedBy: {
      type: String, // admin user ID or "system"
    },

    resolvedAt: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["open", "reviewed", "resolved", "false_positive"],
      default: "open",
    },
  },
  { timestamps: true }
);

// Admin dashboard: all open fraud flags sorted by severity
FraudFlagSchema.index({ status: 1, severity: -1 });
FraudFlagSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("FraudFlag", FraudFlagSchema);
