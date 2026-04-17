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
    origin: function(origin, callback) {
        const allowed = [
            'http://localhost:5173',
            'http://localhost:5174',
            'https://coveer.vercel.app',
        ];
        // Allow any Vercel preview deployment
        if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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

// Admin
app.use('/admin', require('./routes/admin/index'));

// Health check
app.get('/', (req, res) => {
    res.send('Backend is running');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

module.exports = app;
