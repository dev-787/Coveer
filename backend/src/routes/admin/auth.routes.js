const router     = require('express').Router();
const adminAuth  = require('../../middlewares/adminAuth.middleware');
const ctrl       = require('../../controllers/admin/auth.controller');

router.post('/login',  ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me',      adminAuth, ctrl.me);

module.exports = router;
