const User = require('../../models/user.model');

const ALLOWED_FIELDS = ['city', 'plan', 'planStatus', 'dailyEarnings', 'autoRenew', 'trustScore', 'verificationStatus'];

exports.listUsers = async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      search = '',
      plan, city, planStatus, verificationStatus,
    } = req.query;

    const filter = { isDeleted: { $ne: true } };

    if (search) {
      filter.$or = [
        { 'fullName.firstName': { $regex: search, $options: 'i' } },
        { 'fullName.lastName':  { $regex: search, $options: 'i' } },
        { email:                { $regex: search, $options: 'i' } },
      ];
    }
    if (plan)               filter.plan               = plan;
    if (city)               filter.city               = city;
    if (planStatus)         filter.planStatus         = planStatus;
    if (verificationStatus) filter.verificationStatus = verificationStatus;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password -adminLogs -transactions -verificationDocuments')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.isDeleted) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) return res.status(404).json({ message: 'User not found' });

    const logs = [];
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined && String(req.body[field]) !== String(user[field])) {
        logs.push({
          field,
          oldValue:  user[field],
          newValue:  req.body[field],
          changedBy: req.admin._id,
          changedAt: new Date(),
        });
        user[field] = req.body[field];
      }
    }

    if (logs.length) user.adminLogs.push(...logs);
    await user.save();

    const updated = user.toObject();
    delete updated.password;
    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isDeleted = true;
    await user.save();
    return res.json({ message: 'User soft-deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
