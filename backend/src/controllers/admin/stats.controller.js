const User        = require('../../models/user.model');
const CityWeather = require('../../models/cityWeather.model');

function startOfDay(d = new Date()) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}
function startOfWeek() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

exports.overview = async (req, res) => {
  try {
    const [users, weather] = await Promise.all([
      User.find({ isDeleted: { $ne: true } }).select('isVerified planStatus plan wallet.balance transactions createdAt'),
      CityWeather.find({}),
    ]);

    const today     = startOfDay();
    const weekStart = startOfWeek();
    const monthStart = startOfMonth();

    // Users
    const totalUsers    = users.length;
    const verifiedUsers = users.filter(u => u.isVerified).length;
    const activeUsers   = users.filter(u => u.planStatus === 'active').length;
    const newToday      = users.filter(u => u.createdAt >= today).length;
    const newThisWeek   = users.filter(u => u.createdAt >= weekStart).length;

    // Plans
    const basicActive   = users.filter(u => u.plan === 'basic'   && u.planStatus === 'active').length;
    const premiumActive = users.filter(u => u.plan === 'premium' && u.planStatus === 'active').length;
    const inactive      = users.filter(u => u.planStatus !== 'active').length;

    // Payouts
    const allTx = users.flatMap(u => u.transactions.filter(t => t.type === 'payout'));
    const payoutToday = allTx.filter(t => t.createdAt >= today).reduce((s, t) => s + t.amount, 0);
    const payoutWeek  = allTx.filter(t => t.createdAt >= weekStart).reduce((s, t) => s + t.amount, 0);
    const payoutMonth = allTx.filter(t => t.createdAt >= monthStart).reduce((s, t) => s + t.amount, 0);

    // Weather
    const citiesAffected = weather.filter(w => w.isAffected).length;
    const lastFetchTime  = weather.reduce((latest, w) => {
      return w.fetchedAt > latest ? w.fetchedAt : latest;
    }, new Date(0));

    // Wallet
    const totalBalance = users.reduce((s, u) => s + (u.wallet?.balance || 0), 0);

    return res.json({
      users:   { total: totalUsers, verified: verifiedUsers, active: activeUsers, newToday, newThisWeek },
      plans:   { basicActive, premiumActive, inactive },
      payouts: { today: payoutToday, week: payoutWeek, month: payoutMonth },
      weather: { citiesAffected, lastFetchTime },
      wallet:  { totalBalanceAcrossUsers: totalBalance },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.userGrowth = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const users = await User.find({ createdAt: { $gte: since }, isDeleted: { $ne: true } })
      .select('createdAt');

    // Build map using LOCAL date string to avoid UTC day-shift
    const map = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      map[key] = 0;
    }

    for (const u of users) {
      const d = new Date(u.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (map[key] !== undefined) map[key]++;
    }

    const data = Object.entries(map).map(([date, count]) => ({ date, count }));
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.payoutTrend = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 29);
    since.setHours(0, 0, 0, 0);

    const users = await User.find({ isDeleted: { $ne: true } }).select('transactions');

    const map = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      map[key] = { amount: 0, count: 0 };
    }

    for (const u of users) {
      for (const tx of u.transactions) {
        if (tx.type !== 'payout') continue;
        if (tx.createdAt < since) continue;
        const d = new Date(tx.createdAt);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        if (map[key] !== undefined) {
          map[key].amount += tx.amount || 0;
          map[key].count++;
        }
      }
    }

    const data = Object.entries(map).map(([date, { amount, count }]) => ({ date, amount, count }));
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.weatherTrend = async (req, res) => {
  try {
    const HourlyImpact = require('../../models/hourlyImpact.model');
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const all   = await HourlyImpact.find({ createdAt: { $gte: since } })
      .select('impactPercentage isAffected createdAt city');

    // Build 24-slot map keyed by hour (0–23)
    const map = {};
    for (let h = 0; h < 24; h++) {
      map[h] = { total: 0, count: 0, affectedCities: new Set() };
    }

    for (const w of all) {
      const h = new Date(w.createdAt).getHours();
      map[h].total += w.impactPercentage || 0;
      map[h].count++;
      if (w.isAffected) map[h].affectedCities.add(w.city);
    }

    const now = new Date();
    const data = Array.from({ length: 24 }, (_, i) => {
      const h = (now.getHours() - 23 + i + 24) % 24;
      const slot = map[h];
      return {
        hour: `${String(h).padStart(2, '0')}:00`,
        avgImpact: slot.count ? Math.round((slot.total / slot.count) * 10) / 10 : 0,
        affectedCities: slot.affectedCities.size,
      };
    });

    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
