const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const { city, venueType } = req.query;

        let query = `
            SELECT 
                v.*,
                COUNT(DISTINCT e.id) AS total_events
            FROM venues v
            LEFT JOIN events e ON v.id = e.venue_id
        `;

        const conditions = [];
        const params = [];

        if (city) {
            conditions.push('v.city = ?');
            params.push(city);
        }

        if (venueType) {
            conditions.push('v.venue_type = ?');
            params.push(venueType);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' GROUP BY v.id ORDER BY v.name';

        const [venues] = await promisePool.query(query, params);

        res.json({
            status: 'success',
            data: venues
        });
    } catch (error) {
        console.error('Error fetching venues:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch venues'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [venues] = await promisePool.query(
            `SELECT * FROM venues WHERE id = ?`,
            [id]
        );

        if (venues.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Venue not found'
            });
        }

        const [events] = await promisePool.query(`
            SELECT 
                e.id,
                e.title,
                e.event_date,
                e.start_time,
                e.category,
                e.status
            FROM events e
            WHERE e.venue_id = ?
            AND e.event_date >= CURDATE()
            ORDER BY e.event_date ASC
            LIMIT 10
        `, [id]);

        res.json({
            status: 'success',
            data: {
                ...venues[0],
                upcoming_events: events
            }
        });
    } catch (error) {
        console.error('Error fetching venue:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch venue'
        });
    }
});

module.exports = router;
