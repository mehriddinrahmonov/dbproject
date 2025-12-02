// ================================================================
// Concert Ticketing System - Main Server
// Express.js REST API server
// ================================================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Import database connection
const { pool } = require('./config/database');

// Import routes
const eventsRoutes = require('./routes/events');
const ticketsRoutes = require('./routes/tickets');
const paymentsRoutes = require('./routes/payments');
const organizersRoutes = require('./routes/organizers');
const attendeesRoutes = require('./routes/attendees');
const venuesRoutes = require('./routes/venues');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ================================================================
// MIDDLEWARE
// ================================================================

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ================================================================
// API ROUTES
// ================================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    pool.query('SELECT 1', (err) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Database connection failed',
                error: err.message
            });
        }
        res.json({
            status: 'ok',
            message: 'Concert Ticketing System API is running',
            timestamp: new Date().toISOString()
        });
    });
});

// API Routes
app.use('/api/events', eventsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/organizers', organizersRoutes);
app.use('/api/attendees', attendeesRoutes);
app.use('/api/venues', venuesRoutes);

// ================================================================
// ERROR HANDLING
// ================================================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'API endpoint not found'
    });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

// ================================================================
// START SERVER
// ================================================================

app.listen(PORT, () => {
    console.log('================================================');
    console.log('🎵 Concert Ticketing System Server');
    console.log('================================================');
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
    console.log('================================================');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
    });
});

module.exports = app;
