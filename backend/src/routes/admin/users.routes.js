const router = require('express').Router();
const ctrl   = require('../../controllers/admin/users.controller');

router.get('/',       ctrl.listUsers);
router.get('/:id',    ctrl.getUser);
router.patch('/:id',  ctrl.updateUser);
router.delete('/:id', ctrl.deleteUser);

module.exports = router;
