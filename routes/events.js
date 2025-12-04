const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

router.get('/', async (req, res) => {
    try {
        const { category, status, search, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT 
                e.*,
                v.name AS venue_name,
                v.city AS venue_city,
                v.state AS venue_state,
                v.capacity AS venue_capacity,
                o.name AS organizer_name,
                o.company_name AS organizer_company,
                COUNT(DISTINCT t.id) AS tickets_sold,
                SUM(CASE WHEN t.status IN ('paid', 'reserved') THEN 1 ELSE 0 END) AS seats_taken
            FROM events e
            JOIN venues v ON e.venue_id = v.id
            JOIN organizers o ON e.organizer_id = o.id
            LEFT JOIN tickets t ON e.id = t.event_id
        `;

        const conditions = [];
        const params = [];

        if (category) {
            conditions.push('e.category = ?');
            params.push(category);
        }

        if (status) {
            conditions.push('e.status = ?');
            params.push(status);
        }

        if (search) {
            conditions.push('(e.title LIKE ? OR e.description LIKE ?)');
            params.push(`%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += `
            GROUP BY e.id
            ORDER BY e.event_date ASC
            LIMIT ? OFFSET ?
        `;

        params.push(parseInt(limit), parseInt(offset));

        const [events] = await promisePool.query(query, params);

        res.json({
            status: 'success',
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch events'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                e.*,
                v.name AS venue_name,
                v.address AS venue_address,
                v.city AS venue_city,
                v.state AS venue_state,
                v.capacity AS venue_capacity,
                v.venue_type AS venue_type,
                o.name AS organizer_name,
                o.company_name AS organizer_company,
                o.email AS organizer_email,
                COUNT(DISTINCT t.id) AS tickets_sold,
                SUM(CASE WHEN t.status IN ('paid', 'reserved') THEN 1 ELSE 0 END) AS seats_taken
            FROM events e
            JOIN venues v ON e.venue_id = v.id
            JOIN organizers o ON e.organizer_id = o.id
            LEFT JOIN tickets t ON e.id = t.event_id
            WHERE e.id = ?
            GROUP BY e.id
        `;

        const [events] = await promisePool.query(query, [id]);

        if (events.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Event not found'
            });
        }

        const [ticketTypes] = await promisePool.query(
            `SELECT * FROM ticket_types WHERE event_id = ? ORDER BY price DESC`,
            [id]
        );

        const eventData = {
            ...events[0],
            ticket_types: ticketTypes
        };

        res.json({
            status: 'success',
            data: eventData
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch event details'
        });
    }
});

router.get('/meta/categories', async (req, res) => {
    try {
        const [categories] = await promisePool.query(
            `SELECT DISTINCT category FROM events ORDER BY category`
        );

        res.json({
            status: 'success',
            data: categories.map(c => c.category)
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch categories'
        });
    }
});

module.exports = router;
