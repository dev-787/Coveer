const User = require('../../models/user.model');

function startOfDay(d = new Date()) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

function startOfWeek() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getPayoutTransactions({ from, to, city } = {}) {
  const match = {};
  if (city) match.city = city;

  const users = await User.find(match).select('fullName email city platform plan wallet.balance transactions');

  const rows = [];
  for (const u of users) {
    for (const tx of u.transactions) {
      if (tx.type !== 'payout') continue;
      if (from && tx.createdAt < from) continue;
      if (to   && tx.createdAt > to)   continue;
      rows.push({
        userId:    u._id,
        name:      `${u.fullName.firstName} ${u.fullName.lastName}`,
        email:     u.email,
        city:      u.city,
        platform:  u.platform,
        plan:      u.plan,
        amount:    tx.amount,
        status:    tx.status,
        reason:    tx.reason,
        createdAt: tx.createdAt,
      });
    }
  }

  rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return rows;
}

exports.listPayouts = async (req, res) => {
  try {
    const { page = 1, limit = 20, city, from, to } = req.query;
    const fromDate = from ? new Date(from) : undefined;
    const toDate   = to   ? new Date(to)   : undefined;

    const all    = await getPayoutTransactions({ from: fromDate, to: toDate, city });
    const total  = all.length;
    const skip   = (Number(page) - 1) * Number(limit);
    const paged  = all.slice(skip, skip + Number(limit));

    return res.json({ payouts: paged, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.todayPayouts = async (req, res) => {
  try {
    const from = startOfDay();
    const list = await getPayoutTransactions({ from });
    const totalAmount = list.reduce((s, p) => s + (p.amount || 0), 0);
    return res.json({ totalAmount, count: list.length, list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.payoutStats = async (req, res) => {
  try {
    const [allTime, thisMonth, thisWeek] = await Promise.all([
      getPayoutTransactions(),
      getPayoutTransactions({ from: startOfMonth() }),
      getPayoutTransactions({ from: startOfWeek() }),
    ]);

    const sum = arr => arr.reduce((s, p) => s + (p.amount || 0), 0);

    return res.json({
      allTime:   { count: allTime.length,   amount: sum(allTime) },
      thisMonth: { count: thisMonth.length, amount: sum(thisMonth) },
      thisWeek:  { count: thisWeek.length,  amount: sum(thisWeek) },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
