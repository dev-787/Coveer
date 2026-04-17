const router = require('express').Router();
const ctrl   = require('../../controllers/admin/stats.controller');

router.get('/overview',      ctrl.overview);
router.get('/user-growth',   ctrl.userGrowth);
router.get('/payout-trend',  ctrl.payoutTrend);
router.get('/weather-trend', ctrl.weatherTrend);

module.exports = router;
