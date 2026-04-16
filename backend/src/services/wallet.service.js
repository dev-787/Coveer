const User   = require('../models/user.model');
const { PLANS } = require('../constants/plans');
const { notify } = require('./notification.service');

// ── Credit wallet (after Razorpay payment verified) ───────────────────────────
async function creditWallet(userId, amount, reason, razorpayPaymentId = null) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  user.wallet.balance += amount;
  user.transactions.push({ type: 'credit', amount, reason, razorpayPaymentId, status: 'success' });
  await user.save();

  await notify(userId, 'payout', `💰 ₹${amount} added to wallet`, `${reason}. New balance: ₹${user.wallet.balance}`);
  return user.wallet.balance;
}
// ── Debit wallet (plan purchase, manual debit) ────────────────────────────────
async function debitWallet(userId, amount, reason, type = 'debit') {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  if (user.wallet.balance < amount) throw new Error('Insufficient wallet balance');

  user.wallet.balance -= amount;
  user.transactions.push({ type, amount, reason, status: 'success' });
  await user.save();
  return user.wallet.balance;
}

// ── Activate plan (deduct cost, set planStatus active) ────────────────────────
async function activatePlan(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const plan = PLANS[user.plan];
  if (!plan) throw new Error('Invalid plan');
  if (user.wallet.balance < plan.weeklyPrice) {
    throw new Error(`Insufficient balance. Need ₹${plan.weeklyPrice}, have ₹${user.wallet.balance}`);
  }

  const now    = new Date();
  const expiry = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  user.wallet.balance -= plan.weeklyPrice;
  user.planStatus      = 'active';
  user.planActivatedAt = now;
  user.planExpiresAt   = expiry;

  user.transactions.push({
    type:   'premium',
    amount: plan.weeklyPrice,
    reason: `${plan.name} Plan — Week activation`,
    status: 'success',
  });
  await user.save();

  await notify(userId, 'plan',
    `🛡️ ${plan.name} Plan Activated`,
    `₹${plan.weeklyPrice} deducted. Coverage active until ${expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}. Max payout: ₹${plan.maxDailyPayout}/day.`
  );

  return { planStatus: 'active', planExpiresAt: expiry, newBalance: user.wallet.balance };
}

// ── Credit payout (settlement engine — checks planStatus first) ───────────────
async function creditPayout(userId, amount, reason) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (user.planStatus !== 'active') {
    throw new Error('User plan is not active — skipping payout');
  }

  user.wallet.balance += amount;
  user.transactions.push({ type: 'payout', amount, reason, status: 'success' });
  await user.save();

  await notify(userId, 'payout',
    `💰 ₹${amount} payout credited`,
    `${reason}. New wallet balance: ₹${user.wallet.balance}`
  );
  return user.wallet.balance;
}

// ── Check and renew plan (idempotent — safe to call multiple times) ───────────
async function checkAndRenewPlan(userId) {
  const user = await User.findById(userId);
  if (!user) return;

  const now       = new Date();
  const isExpired = user.planExpiresAt && user.planExpiresAt <= now;
  if (!isExpired) return;

  if (!user.autoRenew) {
    user.planStatus = 'expired';
    await user.save();
    await notify(userId, 'plan', '⚠️ Plan Expired', 'Your coverage plan has expired and auto-renew is off. Reactivate to stay covered.');
    return { renewed: false, reason: 'Auto-renew disabled' };
  }

  const plan = PLANS[user.plan];

  if (user.wallet.balance >= plan.weeklyPrice) {
    const newExpiry = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    user.wallet.balance -= plan.weeklyPrice;
    user.planStatus      = 'active';
    user.planActivatedAt = now;
    user.planExpiresAt   = newExpiry;

    user.transactions.push({
      type:   'premium',
      amount: plan.weeklyPrice,
      reason: `${plan.name} Plan — Auto-renewal`,
      status: 'success',
    });
    await user.save();

    await notify(userId, 'plan',
      `🔄 Plan Auto-Renewed`,
      `₹${plan.weeklyPrice} deducted for ${plan.name} plan. Coverage extended to ${newExpiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}.`
    );
    return { renewed: true, newExpiry, newBalance: user.wallet.balance };
  } else {
    user.planStatus = 'inactive';
    await user.save();
    await notify(userId, 'plan',
      '⚠️ Plan Renewal Failed',
      `Insufficient balance to renew ${plan.name} plan (₹${plan.weeklyPrice} needed). Add funds to reactivate.`
    );
    return { renewed: false, reason: 'Insufficient wallet balance' };
  }
}

module.exports = { creditWallet, debitWallet, activatePlan, creditPayout, checkAndRenewPlan };
