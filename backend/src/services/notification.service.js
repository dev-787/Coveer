const Notification = require('../models/notification.model');

// Create a notification for a single user
async function notify(userId, type, title, message) {
  try {
    await Notification.create({ userId, type, title, message });
  } catch (err) {
    console.error('[Notify] Failed to create notification:', err.message);
  }
}

// Create weather alert notifications — only when city is AFFECTED
async function notifyWeatherUpdate(citySnapshots) {
  const User = require('../models/user.model');

  for (const snap of citySnapshots) {
    if (!snap.isAffected) continue; // skip normal conditions — no noise

    try {
      const users = await User.find({ city: snap.city, planStatus: 'active' }).select('_id');
      if (!users.length) continue;

      const title   = `⚠️ ${snap.impactReason} in ${snap.city}`;
      const message = `${snap.impactReason} detected — ${snap.impactPercentage}% impact. `
                    + `Rainfall: ${snap.rainfall}mm/hr · AQI: ${snap.aqi} · Temp: ${snap.temperature}°C. `
                    + `Your payout is being tracked.`;

      const docs = users.map(u => ({ userId: u._id, type: 'weather', title, message }));
      await Notification.insertMany(docs);
    } catch (err) {
      console.error(`[Notify] Weather notify failed for ${snap.city}:`, err.message);
    }
  }
}

module.exports = { notify, notifyWeatherUpdate };
