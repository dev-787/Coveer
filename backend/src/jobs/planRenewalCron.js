const cron = require('node-cron');
const User = require('../models/user.model');
const { checkAndRenewPlan } = require('../services/wallet.service');

function startPlanRenewalCron() {
  // Runs daily at 00:05 AM
  cron.schedule('5 0 * * *', async () => {
    console.log('[Plan Renewal Cron] Starting...');

    const now = new Date();
    const expiredUsers = await User.find({
      planStatus:    { $in: ['active', 'inactive'] },
      planExpiresAt: { $lte: now },
    }).select('_id');

    console.log(`[Plan Renewal Cron] Found ${expiredUsers.length} users to process`);

    for (const user of expiredUsers) {
      try {
        const result = await checkAndRenewPlan(user._id);
        if (result?.renewed) {
          console.log(`[Plan Renewal] User ${user._id} renewed successfully`);
        } else {
          console.log(`[Plan Renewal] User ${user._id} NOT renewed — ${result?.reason}`);
        }
      } catch (err) {
        console.error(`[Plan Renewal] Error for user ${user._id}:`, err.message);
      }
    }

    console.log('[Plan Renewal Cron] Done');
  });

  console.log('[Plan Renewal Cron] Scheduled — runs daily at 00:05 AM');
}

module.exports = { startPlanRenewalCron };
