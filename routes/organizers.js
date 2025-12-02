// ================================================================
// Organizers API Routes
// Handles organizer dashboard and analytics
// ================================================================

const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// ================================================================
// GET /api/organizers/:id/dashboard - Get organizer dashboard data
// ================================================================
router.get('/:id/dashboard', async (req, res) => {
    try {
        const { id } = req.params;

        // Get overall statistics
        const [stats] = await promisePool.query(`
            SELECT 
                COUNT(DISTINCT e.id) AS total_events,
                COUNT(t.id) AS total_tickets_sold,
                SUM(tt.price) AS total_revenue,
                AVG(tt.price) AS avg_ticket_price
            FROM events e
            LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('paid', 'used')
            LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
            WHERE e.organizer_id = ?
        `, [id]);

        // Get events with sales data
        const [events] = await promisePool.query(`
            SELECT 
                e.id,
                e.title,
                e.event_date,
                e.status,
                e.category,
                v.name AS venue_name,
                v.capacity,
                COUNT(t.id) AS tickets_sold,
                SUM(tt.price) AS revenue
            FROM events e
            JOIN venues v ON e.venue_id = v.id
            LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('paid', 'used')
            LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
            WHERE e.organizer_id = ?
            GROUP BY e.id
            ORDER BY e.event_date DESC
            LIMIT 10
        `, [id]);

        // Get revenue by category
        const [categoryRevenue] = await promisePool.query(`
            SELECT 
                e.category,
                COUNT(t.id) AS tickets_sold,
                SUM(tt.price) AS revenue
            FROM events e
            LEFT JOIN tickets t ON e.id = t.event_id AND t.status IN ('paid', 'used')
            LEFT JOIN ticket_types tt ON t.ticket_type_id = tt.id
            WHERE e.organizer_id = ?
            GROUP BY e.category
            ORDER BY revenue DESC
        `, [id]);

        res.json({
            status: 'success',
            data: {
                statistics: stats[0],
                recent_events: events,
                revenue_by_category: categoryRevenue
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch dashboard data'
        });
    }
});

// ================================================================
// GET /api/organizers - List all organizers
// ================================================================
router.get('/', async (req, res) => {
    try {
        const [organizers] = await promisePool.query(`
            SELECT 
                o.*,
                COUNT(DISTINCT e.id) AS event_count
            FROM organizers o
            LEFT JOIN events e ON o.id = e.organizer_id
            GROUP BY o.id
            ORDER BY o.company_name
        `);

        res.json({
            status: 'success',
            data: organizers
        });
    } catch (error) {
        console.error('Error fetching organizers:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch organizers'
        });
    }
});

module.exports = router;
