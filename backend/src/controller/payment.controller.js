const crypto   = require('crypto');
const razorpay = require('../config/razorpay');
const User     = require('../models/user.model');
const { creditWallet, activatePlan } = require('../services/wallet.service');

// POST /payments/add-funds/order
const createAddFundsOrder = async (req, res) => {
  try {
    if (req.user.verificationStatus !== 'verified') {
      return res.status(403).json({ message: 'Complete identity verification before adding funds.' });
    }

    const { amount } = req.body;
    if (!amount || amount < 25) {
      return res.status(400).json({ message: 'Minimum amount is ₹25' });
    }

    const order = await razorpay.orders.create({
      amount:   amount * 100, // paise
      currency: 'INR',
      receipt:  `w_${req.user._id.toString().slice(-8)}_${Date.now().toString().slice(-8)}`,
      notes:    { userId: req.user._id.toString(), purpose: 'wallet_topup' },
    });

    return res.status(200).json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('[Payment] createAddFundsOrder error:', err);
    return res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// POST /payments/add-funds/verify
const verifyAndCreditWallet = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    // Signature verification — mandatory security step
    const body              = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
    }

    const amountInRupees = amount / 100;
    const newBalance = await creditWallet(
      req.user._id,
      amountInRupees,
      'Wallet top-up via Razorpay',
      razorpay_payment_id
    );

    return res.status(200).json({ message: 'Wallet credited successfully', newBalance, credited: amountInRupees });
  } catch (err) {
    console.error('[Payment] verifyAndCreditWallet error:', err);
    return res.status(500).json({ message: 'Failed to verify payment' });
  }
};

// POST /payments/activate-plan
const activatePlanHandler = async (req, res) => {
  try {
    const result = await activatePlan(req.user._id);
    return res.status(200).json({ message: 'Plan activated successfully', ...result });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// POST /payments/withdraw
const withdrawFunds = async (req, res) => {
  try {
    const { amount, upiId } = req.body;
    const user = await User.findById(req.user._id);

    if (user.verificationStatus !== 'verified') {
      return res.status(403).json({ message: 'Complete identity verification before withdrawing funds.' });
    }

    if (!amount || amount < 10) {
      return res.status(400).json({ message: 'Minimum withdrawal is ₹10' });
    }
    if (user.wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Razorpay Payout (requires Razorpay X account — test mode)
    const payout = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      fund_account: {
        account_type: 'vpa',
        vpa:          { address: upiId },
        contact: {
          name:    `${user.fullName.firstName} ${user.fullName.lastName}`,
          email:   user.email,
          contact: '9999999999',
          type:    'self',
        },
      },
      amount:   amount * 100,
      currency: 'INR',
      mode:     'UPI',
      purpose:  'payout',
      queue_if_low_balance: false,
      notes:    { userId: user._id.toString(), reason: 'Coveer wallet withdrawal' },
    });

    user.wallet.balance -= amount;
    user.wallet.upiId    = upiId;
    user.transactions.push({
      type:             'withdrawal',
      amount,
      reason:           `UPI withdrawal to ${upiId}`,
      razorpayPayoutId: payout.id,
      status:           'success',
    });

    await user.save();
    return res.status(200).json({ message: 'Withdrawal initiated', newBalance: user.wallet.balance, payoutId: payout.id });
  } catch (err) {
    console.error('[Payment] withdrawFunds error:', err);
    return res.status(500).json({ message: err.message || 'Withdrawal failed' });
  }
};

// GET /payments/wallet
const getWalletData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('wallet transactions planStatus planExpiresAt plan autoRenew')
      .lean();

    return res.status(200).json({
      balance:       user.wallet.balance,
      upiId:         user.wallet.upiId,
      planStatus:    user.planStatus,
      planExpiresAt: user.planExpiresAt,
      plan:          user.plan,
      autoRenew:     user.autoRenew,
      transactions:  user.transactions
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 50),
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch wallet data' });
  }
};

module.exports = { createAddFundsOrder, verifyAndCreditWallet, activatePlanHandler, withdrawFunds, getWalletData };
