// ================================================================
// Tickets API Routes
// Handles ticket reservations and purchases
// ================================================================

const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

// ================================================================
// GET /api/tickets/availability/:eventId - Check ticket availability
// ================================================================
router.get('/availability/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;

        const query = `
            SELECT 
                tt.*,
                (tt.quantity_available - 
                    COALESCE(
                        (SELECT COUNT(*) FROM tickets t 
                         WHERE t.ticket_type_id = tt.id 
                         AND t.status IN ('paid', 'reserved')), 
                    0)
                ) AS available_now
            FROM ticket_types tt
            WHERE tt.event_id = ?
            ORDER BY tt.price DESC
        `;

        const [ticketTypes] = await promisePool.query(query, [eventId]);

        res.json({
            status: 'success',
            data: ticketTypes
        });
    } catch (error) {
        console.error('Error checking availability:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to check ticket availability'
        });
    }
});

// ================================================================
// POST /api/tickets/reserve - Reserve tickets (without payment)
// ================================================================
router.post('/reserve', async (req, res) => {
    const connection = await promisePool.getConnection();

    try {
        const { eventId, ticketTypeId, attendeeId, quantity = 1 } = req.body;

        if (!eventId || !ticketTypeId || !attendeeId) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        await connection.beginTransaction();

        // Check availability
        const [ticketType] = await connection.query(
            `SELECT * FROM ticket_types WHERE id = ? AND event_id = ?`,
            [ticketTypeId, eventId]
        );

        if (ticketType.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                status: 'error',
                message: 'Ticket type not found'
            });
        }

        // Check if enough tickets available
        const [soldCount] = await connection.query(
            `SELECT COUNT(*) as sold FROM tickets 
             WHERE ticket_type_id = ? AND status IN ('paid', 'reserved')`,
            [ticketTypeId]
        );

        const available = ticketType[0].quantity_available - soldCount[0].sold;

        if (available < quantity) {
            await connection.rollback();
            return res.status(400).json({
                status: 'error',
                message: `Only ${available} tickets available`
            });
        }

        // Reserve tickets
        const ticketIds = [];
        for (let i = 0; i < quantity; i++) {
            const seatNumber = ticketType[0].type_name.includes('VIP')
                ? `VIP-${Date.now()}-${i}`
                : ticketType[0].type_name.includes('GA') || ticketType[0].type_name.includes('General')
                    ? 'GA'
                    : `SEAT-${Date.now()}-${i}`;

            const [result] = await connection.query(
                `INSERT INTO tickets (event_id, ticket_type_id, attendee_id, seat_number, status, is_vip)
                 VALUES (?, ?, ?, ?, 'reserved', ?)`,
                [eventId, ticketTypeId, attendeeId, seatNumber, ticketType[0].type_name.includes('VIP')]
            );

            ticketIds.push(result.insertId);
        }

        await connection.commit();

        res.json({
            status: 'success',
            message: `${quantity} ticket(s) reserved successfully`,
            data: {
                ticketIds,
                expiresIn: '15 minutes'
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error reserving tickets:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to reserve tickets'
        });
    } finally {
        connection.release();
    }
});

// ================================================================
// GET /api/tickets/my-tickets/:attendeeId - Get user's tickets
// ================================================================
router.get('/my-tickets/:attendeeId', async (req, res) => {
    try {
        const { attendeeId } = req.params;

        const query = `
            SELECT 
                t.*,
                e.title AS event_title,
                e.event_date,
                e.start_time,
                v.name AS venue_name,
                v.address AS venue_address,
                tt.type_name,
                tt.price,
                tt.perks
            FROM tickets t
            JOIN events e ON t.event_id = e.id
            JOIN venues v ON e.venue_id = v.id
            JOIN ticket_types tt ON t.ticket_type_id = tt.id
            WHERE t.attendee_id = ?
            ORDER BY e.event_date DESC
        `;

        const [tickets] = await promisePool.query(query, [attendeeId]);

        res.json({
            status: 'success',
            count: tickets.length,
            data: tickets
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch tickets'
        });
    }
});

module.exports = router;
