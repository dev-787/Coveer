const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

async function registerUser(req, res) {
  try {
    const { fullName, email, password, dob, platform, city, dailyEarnings, plan, autoRenew } = req.body;

    // Validate required fields
    if (!email || !password || !fullName?.firstName || !fullName?.lastName || !dob || !platform || !city || dailyEarnings == null || !plan) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isUserAlreadyExist = await userModel.findOne({ email });
    if (isUserAlreadyExist) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullName: { firstName: fullName.firstName, lastName: fullName.lastName },
      email,
      password: hashedPassword,
      dob,
      platform,
      city,
      dailyEarnings: Number(dailyEarnings),
      plan,
      autoRenew: autoRenew ?? true,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);

    return res.status(201).json({
      message: "Registration successful",
      userId: user._id,
    });
  } catch (err) {
    // Handle mongoose duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already registered" });
    }
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.cookie("token", token);

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id:      user._id,
        email:    user.email,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
    registerUser,
    loginUser
};