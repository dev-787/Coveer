const mongoose = require("mongoose");

const DisruptionSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
    },

    zone: {
      type: String, // specific zone within city; null means entire city affected
    },

    hour: {
      type: Date, // e.g. 2024-06-15T14:00:00Z → represents the 2PM–3PM window
      required: true,
    },

    type: {
      type: String,
      enum: ["rain", "heatwave", "aqi", "curfew", "flood", "other"],
      required: true,
    },

    // Raw API values
    rawData: {
      rainfall_mm: Number,       // from OpenWeather
      temperature_c: Number,     // from OpenWeather
      aqi_value: Number,         // from AQI API
      wind_speed_kmh: Number,
    },

    // Computed impact level (0, 30, 60, or 100)
    impactPercent: {
      type: Number,
      enum: [0, 30, 60, 100],
      required: true,
    },

    // Human readable label
    severity: {
      type: String,
      enum: ["none", "light", "heavy", "extreme"],
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for fast hourly zone lookups during settlement
DisruptionSchema.index({ city: 1, hour: 1 });
DisruptionSchema.index({ zone: 1, hour: 1 });

module.exports = mongoose.model("Disruption", DisruptionSchema);
