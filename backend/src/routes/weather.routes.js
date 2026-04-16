const router = require('express').Router();
const { authUser } = require('../middlewares/auth.middleware');
const { getCurrentWeather, getWeatherHistory } = require('../controller/weather.controller');

router.get('/current', authUser, getCurrentWeather);
router.get('/history', authUser, getWeatherHistory);

module.exports = router;
