const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes         = require('./routes/auth.routes');
const verificationRoutes = require('./routes/verification.routes');
const weatherRoutes      = require('./routes/weather.routes');
const paymentRoutes      = require('./routes/payment.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/auth',     authRoutes);
app.use('/verify',   verificationRoutes);
app.use('/weather',  weatherRoutes);
app.use('/payments',      paymentRoutes);
app.use('/notifications', notificationRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

module.exports = app;
