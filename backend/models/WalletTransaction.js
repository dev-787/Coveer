const mongoose = require("mongoose");

const WalletTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },

    category: {
      type: String,
      enum: [
        "payout",          // +₹450 Rain Impact Payout
        "premium_deduction", // -₹25 Weekly Premium
        "withdrawal_upi",  // user withdrawing to UPI
        "withdrawal_bank", // user withdrawing to bank
        "refund",          // edge case refund
      ],
      required: true,
    },

    amount: {
      type: Number, // always positive; type field tells credit/debit
      required: true,
    },

    balanceBefore: {
      type: Number,
      required: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    description: {
      type: String, // e.g. "Rain Impact Payout - 15 Jun"
    },

    // For withdrawals via Razorpay
    razorpayPayoutId: {
      type: String,
    },

    razorpayStatus: {
      type: String,
      enum: ["initiated", "processing", "done", "failed", null],
      default: null,
    },

    // Link back to the payout record if this was a payout credit
    linkedPayout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payout",
    },

    status: {
      type: String,
      enum: ["success", "pending", "failed"],
      default: "success",
    },
  },
  { timestamps: true }
);

// Fast transaction history per user
WalletTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
