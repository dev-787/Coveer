const mongoose = require('mongoose');

/**
 * HourlyImpact — append-only history, one record per city per hour.
 * Used by settlement to see how long/how much a city was affected.
 * `settled` flag prevents double-payment on server restart.
 */
const hourlyImpactSchema = new mongoose.Schema({
  city:             { type: String, required: true },
  hourKey:          { type: String, required: true }, // "2026-04-01T14" UTC
  impactPercentage: { type: Number, required: true },
  impactReason:     { type: String, required: true },
  isAffected:       { type: Boolean, required: true },
  rainfall:         Number,
  aqi:              Number,
  temperature:      Number,
  settled:          { type: Boolean, default: false },
  createdAt:        { type: Date, default: Date.now },
});

// One record per city per hour — upsert-safe
hourlyImpactSchema.index({ city: 1, hourKey: 1 }, { unique: true });

// Auto-delete after 30 days
hourlyImpactSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('HourlyImpact', hourlyImpactSchema);
