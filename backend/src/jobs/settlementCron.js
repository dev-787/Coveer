const cron         = require('node-cron');
const User         = require('../models/user.model');
const HourlyImpact = require('../models/hourlyImpact.model');
const { creditPayout } = require('../services/wallet.service');
const { PLANS }    = require('../constants/plans');

/**
 * Settlement — runs at **:55.
 * Reads HourlyImpact records for the current hour that are affected + unsettled.
 * Marks settled=true BEFORE crediting — restart-safe, no double-pay.
 */
async function runSettlement() {
  const hourKey = new Date().toISOString().slice(0, 13); // "2026-04-01T14"
  console.log(`[Settlement] Running for hour ${hourKey}`);

  const impacts = await HourlyImpact.find({ hourKey, isAffected: true, settled: false }).lean();

  if (!impacts.length) {
    console.log('[Settlement] No unsettled affected cities this hour — done');
    return;
  }

  console.log(`[Settlement] Affected: ${impacts.map(i => i.city).join(', ')}`);

  for (const impact of impacts) {
    // Mark settled FIRST — prevents double-pay on restart
    await HourlyImpact.updateOne({ _id: impact._id }, { settled: true });

    const users = await User.find({ city: impact.city, planStatus: 'active' })
      .select('_id plan dailyEarnings');

    console.log(`[Settlement] ${impact.city} — ${users.length} users`);

    for (const user of users) {
      try {
        const hourlyIncome = Math.round(user.dailyEarnings / 8);
        const rawPayout    = Math.round(hourlyIncome * (impact.impactPercentage / 100));
        const finalPayout  = Math.min(rawPayout, PLANS[user.plan].maxDailyPayout);
        if (finalPayout <= 0) continue;

        await creditPayout(
          user._id,
          finalPayout,
          `Hourly payout — ${impact.city} — ${impact.impactReason} (${impact.impactPercentage}%)`
        );
        console.log(`[Settlement] User ${user._id} +₹${finalPayout}`);
      } catch (err) {
        console.error(`[Settlement] Error for user ${user._id}:`, err.message);
      }
    }
  }

  console.log('[Settlement] Done');
}

function startSettlementCron() {
  cron.schedule('55 * * * *', async () => { await runSettlement(); });
  console.log('[Settlement Cron] Scheduled — runs at **:55');
}

module.exports = { startSettlementCron, runSettlement };
