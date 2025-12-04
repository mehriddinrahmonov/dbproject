const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const { pool } = require('./config/database');

const eventsRoutes = require('./routes/events');
const ticketsRoutes = require('./routes/tickets');
const paymentsRoutes = require('./routes/payments');
const organizersRoutes = require('./routes/organizers');
const attendeesRoutes = require('./routes/attendees');
const venuesRoutes = require('./routes/venues');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

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

app.use('/api/events', eventsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/organizers', organizersRoutes);
app.use('/api/attendees', attendeesRoutes);
app.use('/api/venues', venuesRoutes);

app.use('/api/*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'API endpoint not found'
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    pool.end(() => {
        console.log('Database pool closed');
        process.exit(0);
    });
});

module.exports = app;
