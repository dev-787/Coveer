const mongoose = require("mongoose");

const ImpactLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    disruption: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disruption",
      required: true,
    },

    date: {
      type: Date, // the calendar date this log belongs to (for settlement grouping)
      required: true,
    },

    hour: {
      type: Date, // exact hour slot, e.g. 2024-06-15T14:00:00Z
      required: true,
    },

    impactPercent: {
      type: Number,
      enum: [0, 30, 60, 100],
      required: true,
    },

    // Payout calculated for this single hour
    hourlyPayout: {
      type: Number, // in INR
      required: true,
    },

    // Whether this hour was included in the final 10PM settlement
    settled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate logs for same user + same hour
ImpactLogSchema.index({ user: 1, hour: 1 }, { unique: true });

// Fast lookup for 10PM settlement engine: all unsettled logs for a date
ImpactLogSchema.index({ date: 1, settled: 1 });

module.exports = mongoose.model("ImpactLog", ImpactLogSchema);
