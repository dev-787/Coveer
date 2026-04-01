const express = require("express")
const { registerUser, loginUser, getMe, logout } = require("../controller/auth.controller")
const { authUser } = require("../middlewares/auth.middleware")
const router = express.Router()

router.post("/register", registerUser)
router.post("/login",    loginUser)
router.get("/me",        authUser, getMe)
router.post("/logout",   logout)

module.exports = router

// PATCH /auth/update-plan — change plan (takes effect on next renewal)
router.patch('/update-plan', authUser, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['basic', 'premium'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }
    const User = require('../models/user.model');
    await User.findByIdAndUpdate(req.user._id, { plan });
    return res.status(200).json({ message: 'Plan updated' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update plan' });
  }
});
