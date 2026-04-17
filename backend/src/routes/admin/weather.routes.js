const router = require('express').Router();
const ctrl   = require('../../controllers/admin/weather.controller');

router.get('/',        ctrl.listWeather);
router.get('/summary', ctrl.weatherSummary);

module.exports = router;
