const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    upiId: {
      type: String,
      default: null,
    },
    bankAccount: {
      accountNumber: { type: String, default: null },
      ifsc: { type: String, default: null },
      holderName: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

const walletModel = mongoose.model("wallet", walletSchema);

module.exports = walletModel;
