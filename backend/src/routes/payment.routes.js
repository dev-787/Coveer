const router = require('express').Router();
const { authUser } = require('../middlewares/auth.middleware');
const {
  createAddFundsOrder,
  verifyAndCreditWallet,
  activatePlanHandler,
  withdrawFunds,
  getWalletData,
} = require('../controller/payment.controller');

router.post('/add-funds/order',  authUser, createAddFundsOrder);
router.post('/add-funds/verify', authUser, verifyAndCreditWallet);
router.post('/activate-plan',    authUser, activatePlanHandler);
router.post('/withdraw',         authUser, withdrawFunds);
router.get('/wallet',            authUser, getWalletData);

module.exports = router;
