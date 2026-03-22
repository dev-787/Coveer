const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Frontend URL, adjust if needed
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Backend is running');
});

module.exports = app;
