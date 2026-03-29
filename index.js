require('dotenv').config();

const express = require('express');
const cors = require('cors');
const chatRoute = require('./src/routes/chat');
const memoryRoute = require('./src/routes/memory');
const personalityRoute = require('./src/routes/personality');
const { chatLimiter } = require('./src/middleware/rateLimiter');
const { requestLogger } = require('./src/middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — restrict to specific origin in production via CORS_ORIGIN env var
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
}));

// Middleware
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/chat', chatLimiter, chatRoute);
app.use('/memory', memoryRoute);
app.use('/personality', personalityRoute);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()) + 's' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
