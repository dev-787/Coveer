const router    = require('express').Router();
const adminAuth = require('../../middlewares/adminAuth.middleware');

const authRoutes    = require('./auth.routes');
const usersRoutes   = require('./users.routes');
const weatherRoutes = require('./weather.routes');
const payoutsRoutes = require('./payouts.routes');
const statsRoutes   = require('./stats.routes');

router.use('/auth',    authRoutes);
router.use('/users',   adminAuth, usersRoutes);
router.use('/weather', adminAuth, weatherRoutes);
router.use('/payouts', adminAuth, payoutsRoutes);
router.use('/stats',   adminAuth, statsRoutes);

module.exports = router;
