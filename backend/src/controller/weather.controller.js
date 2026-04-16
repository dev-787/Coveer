const CityWeather = require('../models/cityWeather.model');

// GET /weather/current — queries MongoDB only, never calls external API
const getCurrentWeather = async (req, res) => {
  try {
    const userCity = req.user.city;

    const latest = await CityWeather.findOne({ city: userCity }).lean();

    if (!latest) {
      return res.status(404).json({
        message: 'Weather data not yet available for your city. Check back in a moment.',
      });
    }

    const hourlyIncome = Math.round(req.user.dailyEarnings / 8);
    const estimatedHourlyPayout = Math.round(hourlyIncome * (latest.impactPercentage / 100));

    return res.status(200).json({
      weather: {
        city:               latest.city,
        temperature:        latest.temperature,
        feelsLike:          latest.feelsLike,
        rainfall:           latest.rainfall,
        weatherMain:        latest.weatherMain,
        weatherDescription: latest.weatherDescription,
        windSpeed:          latest.windSpeed,
        humidity:           latest.humidity,
        aqi:                latest.aqi,
        aqiCategory:        latest.aqiCategory,
        fetchedAt:          latest.fetchedAt,
      },
      impact: {
        percentage:            latest.impactPercentage,
        isAffected:            latest.isAffected,
        reason:                latest.impactReason,
        estimatedHourlyPayout,
      },
    });
  } catch (err) {
    console.error('[Weather Controller]', err);
    return res.status(500).json({ message: 'Failed to fetch weather data' });
  }
};

// GET /weather/history — for settlement engine
const getWeatherHistory = async (req, res) => {
  try {
    const { city, hours = 24 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const history = await CityWeather.find({ city, fetchedAt: { $gte: since } })
      .sort({ fetchedAt: 1 })
      .select('city impactPercentage isAffected impactReason fetchedAt')
      .lean();

    return res.status(200).json({ city, hours, history });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch history' });
  }
};

module.exports = { getCurrentWeather, getWeatherHistory };
