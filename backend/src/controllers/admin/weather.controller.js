const CityWeather = require('../../models/cityWeather.model');

exports.listWeather = async (req, res) => {
  try {
    const { city, limit = 50 } = req.query;
    const filter = {};
    if (city) filter.city = { $regex: city, $options: 'i' };

    const data = await CityWeather.find(filter)
      .sort({ fetchedAt: -1 })
      .limit(Number(limit));

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.weatherSummary = async (req, res) => {
  try {
    const all = await CityWeather.find({});

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalToday    = all.filter(d => d.fetchedAt >= today).length;
    const citiesAffected = all.filter(d => d.isAffected).length;
    const avgImpact     = all.length
      ? all.reduce((s, d) => s + (d.impactPercentage || 0), 0) / all.length
      : 0;

    const lastFetchPerCity = {};
    for (const d of all) {
      if (!lastFetchPerCity[d.city] || d.fetchedAt > lastFetchPerCity[d.city]) {
        lastFetchPerCity[d.city] = d.fetchedAt;
      }
    }

    return res.json({
      totalToday,
      citiesAffected,
      avgImpact: Math.round(avgImpact * 100) / 100,
      lastFetchPerCity,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
