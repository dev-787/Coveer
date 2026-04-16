const axios        = require('axios');
const CityWeather  = require('../models/cityWeather.model');
const HourlyImpact = require('../models/hourlyImpact.model');
const { notifyWeatherUpdate } = require('./notification.service');

const SUPPORTED_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
];

// ── Impact calculation ────────────────────────────────────────────────────────
function computeImpact(rainfall, temperature, aqi) {
  let impact = 0;
  let reason = 'Normal';

  if (rainfall > 15)        { impact = 100; reason = 'Extreme Rain'; }
  else if (rainfall > 7.5)  { impact = 60;  reason = 'Heavy Rain';   }
  else if (rainfall > 2.5)  { impact = 30;  reason = 'Light Rain';   }

  if (temperature > 45 && impact < 100) { impact = Math.max(impact, 100); reason = 'Extreme Heat'; }
  else if (temperature > 42 && impact < 50) { impact = Math.max(impact, 50); reason = 'Heatwave'; }

  if (aqi > 300 && impact < 60) { impact = Math.max(impact, 60); reason = 'Hazardous AQI'; }
  else if (aqi > 200 && impact < 30) { impact = Math.max(impact, 30); reason = 'Unhealthy AQI'; }

  return { impactPercentage: impact, isAffected: impact > 0, impactReason: reason };
}

// ── PM2.5 → AQI conversion ────────────────────────────────────────────────────
function convertAQI(pm25) {
  if (pm25 <= 12)  return { aqi: Math.round(pm25 * 4.17),            category: 'Good' };
  if (pm25 <= 35)  return { aqi: Math.round(50  + (pm25 - 12)  * 2.1),  category: 'Moderate' };
  if (pm25 <= 55)  return { aqi: Math.round(100 + (pm25 - 35)  * 0.99), category: 'Unhealthy for Sensitive' };
  if (pm25 <= 150) return { aqi: Math.round(150 + (pm25 - 55)  * 0.51), category: 'Unhealthy' };
  if (pm25 <= 250) return { aqi: Math.round(200 + (pm25 - 150)),         category: 'Very Unhealthy' };
  return               { aqi: Math.round(300 + (pm25 - 250) * 0.99),     category: 'Hazardous' };
}

// ── Per-city fetch (internal) ─────────────────────────────────────────────────
async function fetchCityWeather(city) {
  const APIKEY = process.env.OPENWEATHER_API_KEY;

  const weatherRes = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${APIKEY}&units=metric`
  );
  const w = weatherRes.data;
  const rainfall = w.rain?.['1h'] ?? 0;
  const { lat, lon } = w.coord;

  const aqiRes = await axios.get(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${APIKEY}`
  );
  const pm25 = aqiRes.data.list[0].components.pm2_5;
  const { aqi, category: aqiCategory } = convertAQI(pm25);

  const { impactPercentage, isAffected, impactReason } = computeImpact(rainfall, w.main.temp, aqi);

  // Upsert CityWeather — one doc per city, updated in place
  await CityWeather.findOneAndUpdate(
    { city },
    {
      temperature:        w.main.temp,
      feelsLike:          w.main.feels_like,
      rainfall,
      weatherMain:        w.weather[0].main,
      weatherDescription: w.weather[0].description,
      windSpeed:          w.wind.speed,
      humidity:           w.main.humidity,
      visibility:         w.visibility,
      pm25,
      aqi,
      aqiCategory,
      impactPercentage,
      isAffected,
      impactReason,
      fetchedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // Upsert HourlyImpact — always update so latest fetch data is used
  const hourKey = new Date().toISOString().slice(0, 13);
  await HourlyImpact.findOneAndUpdate(
    { city, hourKey },
    {
      city, hourKey,
      impactPercentage, impactReason, isAffected,
      rainfall, aqi, temperature: w.main.temp,
      // Only reset settled to false if impact changed — don't re-settle already paid hours
      ...(isAffected ? { $setOnInsert: { settled: false } } : {}),
    },
    { upsert: true, new: true }
  );

  console.log(`[Weather Cron] Updated ${city} — ${impactReason} (${impactPercentage}%)`);
}

// ── Main export — called by cron ──────────────────────────────────────────────
async function fetchAndStoreWeatherForAllCities() {
  console.log(`[Weather Cron] Starting fetch for ${SUPPORTED_CITIES.length} cities at ${new Date().toISOString()}`);

  const results = await Promise.allSettled(
    SUPPORTED_CITIES.map(city => fetchCityWeather(city))
  );

  const success   = results.filter(r => r.status === 'fulfilled').length;
  const failed    = results.filter(r => r.status === 'rejected').length;
  if (failed > 0) {
    results.filter(r => r.status === 'rejected').forEach((r, i) => {
      console.error(`[Weather Cron] Failed city ${i}:`, r.reason?.message);
    });
  }
  console.log(`[Weather Cron] Done — ${success} success, ${failed} failed`);

  // Notify users in affected cities
  if (success > 0) {
    try {
      const snapshots = await CityWeather.find({ city: { $in: SUPPORTED_CITIES } }).lean();
      await notifyWeatherUpdate(snapshots);
    } catch (err) {
      console.error('[Weather Cron] Notification error:', err.message);
    }
  }
}

module.exports = { fetchAndStoreWeatherForAllCities };
