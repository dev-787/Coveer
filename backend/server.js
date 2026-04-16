require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const { startWeatherCron }      = require('./src/jobs/weatherCron');
const { startPlanRenewalCron }  = require('./src/jobs/planRenewalCron');
const { startSettlementCron }   = require('./src/jobs/settlementCron');

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    startWeatherCron();
    startSettlementCron();
    startPlanRenewalCron();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
