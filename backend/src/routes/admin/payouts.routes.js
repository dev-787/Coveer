const router = require('express').Router();
const ctrl   = require('../../controllers/admin/payouts.controller');

router.get('/',       ctrl.listPayouts);
router.get('/today',  ctrl.todayPayouts);
router.get('/stats',  ctrl.payoutStats);

module.exports = router;
