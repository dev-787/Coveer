const cron = require('node-cron');
const { fetchAndStoreWeatherForAllCities } = require('../services/weather.service');

function startWeatherCron() {
  // Runs at minute 50 of every hour — fetches + stores CityWeather snapshots
  cron.schedule('50 * * * *', async () => {
    await fetchAndStoreWeatherForAllCities();
  });

  // Run immediately on server start so dashboard always has fresh data
  // This is safe — it only writes CityWeather, no payments involved
  fetchAndStoreWeatherForAllCities();

  console.log('[Weather Cron] Scheduled — runs at **:50');
}

module.exports = { startWeatherCron };
