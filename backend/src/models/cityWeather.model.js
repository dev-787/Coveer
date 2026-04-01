const mongoose = require('mongoose');

/**
 * CityWeather — ONE document per city, updated in place on every fetch.
 * This is the live "current conditions" record for the dashboard.
 */
const cityWeatherSchema = new mongoose.Schema({
  city:               { type: String, required: true, unique: true }, // unique — one doc per city
  temperature:        Number,
  feelsLike:          Number,
  rainfall:           { type: Number, default: 0 },
  weatherMain:        String,
  weatherDescription: String,
  windSpeed:          Number,
  humidity:           Number,
  visibility:         Number,
  pm25:               Number,
  aqi:                Number,
  aqiCategory:        String,
  impactPercentage:   Number,
  isAffected:         Boolean,
  impactReason:       String,
  fetchedAt:          { type: Date, default: Date.now },
});

module.exports = mongoose.model('CityWeather', cityWeatherSchema);
