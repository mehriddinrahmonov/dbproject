const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

router.post('/process', async (req, res) => {
    const connection = await promisePool.getConnection();

    try {
        const { attendeeId, ticketIds, paymentMethod, promoCode } = req.body;

        if (!attendeeId || !ticketIds || ticketIds.length === 0 || !paymentMethod) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields'
            });
        }

        await connection.beginTransaction();

        const [tickets] = await connection.query(
            `SELECT t.*, tt.price 
             FROM tickets t
             JOIN ticket_types tt ON t.ticket_type_id = tt.id
             WHERE t.id IN (${ticketIds.map(() => '?').join(',')})
             AND t.attendee_id = ?`,
            [...ticketIds, attendeeId]
        );

        if (tickets.length !== ticketIds.length) {
            await connection.rollback();
            return res.status(400).json({
                status: 'error',
                message: 'Invalid ticket IDs or tickets do not belong to this attendee'
            });
        }

        let totalAmount = tickets.reduce((sum, ticket) => sum + parseFloat(ticket.price), 0);
        let promoCodeId = null;
        let discountAmount = 0;

        if (promoCode) {
            const [promoCodes] = await connection.query(
                `SELECT * FROM promo_codes 
                 WHERE code = ? AND active = TRUE 
                 AND valid_from <= NOW() 
                 AND (valid_until IS NULL OR valid_until >= NOW())
                 AND uses_count < max_uses`,
                [promoCode]
            );

            if (promoCodes.length > 0) {
                const promo = promoCodes[0];
                promoCodeId = promo.id;

                if (promo.discount_percent > 0) {
                    discountAmount = totalAmount * (promo.discount_percent / 100);
                } else if (promo.discount_amount > 0) {
                    discountAmount = Math.min(promo.discount_amount, totalAmount);
                }

                totalAmount -= discountAmount;
            }
        }

        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const [paymentResult] = await connection.query(
            `INSERT INTO payments (attendee_id, amount, payment_method, promo_code_id, transaction_id, status)
             VALUES (?, ?, ?, ?, ?, 'completed')`,
            [attendeeId, totalAmount.toFixed(2), paymentMethod, promoCodeId, transactionId]
        );

        const paymentId = paymentResult.insertId;

        for (const ticketId of ticketIds) {
            await connection.query(
                `INSERT INTO payment_tickets (payment_id, ticket_id) VALUES (?, ?)`,
                [paymentId, ticketId]
            );

            await connection.query(
                `UPDATE tickets SET status = 'paid' WHERE id = ?`,
                [ticketId]
            );
        }

        await connection.commit();

        res.json({
            status: 'success',
            message: 'Payment processed successfully',
            data: {
                paymentId,
                transactionId,
                amount: totalAmount.toFixed(2),
                discountApplied: discountAmount.toFixed(2),
                ticketCount: ticketIds.length
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error processing payment:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process payment'
        });
    } finally {
        connection.release();
    }
});

router.post('/validate-promo', async (req, res) => {
    try {
        const { code, amount } = req.body;

        if (!code) {
            return res.status(400).json({
                status: 'error',
                message: 'Promo code required'
            });
        }

        const [promoCodes] = await promisePool.query(
            `SELECT * FROM promo_codes 
             WHERE code = ? AND active = TRUE 
             AND valid_from <= NOW() 
             AND (valid_until IS NULL OR valid_until >= NOW())
             AND uses_count < max_uses`,
            [code]
        );

        if (promoCodes.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Invalid or expired promo code'
            });
        }

        const promo = promoCodes[0];
        let discount = 0;

        if (promo.discount_percent > 0) {
            discount = amount ? (amount * (promo.discount_percent / 100)) : 0;
        } else if (promo.discount_amount > 0) {
            discount = promo.discount_amount;
        }

        res.json({
            status: 'success',
            data: {
                code: promo.code,
                discountPercent: promo.discount_percent,
                discountAmount: promo.discount_amount,
                calculatedDiscount: discount.toFixed(2),
                remainingUses: promo.max_uses - promo.uses_count
            }
        });
    } catch (error) {
        console.error('Error validating promo code:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to validate promo code'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT 
                p.*,
                CONCAT(a.first_name, ' ', a.last_name) AS attendee_name,
                a.email AS attendee_email,
                pc.code AS promo_code,
                GROUP_CONCAT(t.id) AS ticket_ids
            FROM payments p
            JOIN attendees a ON p.attendee_id = a.id
            LEFT JOIN promo_codes pc ON p.promo_code_id = pc.id
            LEFT JOIN payment_tickets pt ON p.id = pt.payment_id
            LEFT JOIN tickets t ON pt.ticket_id = t.id
            WHERE p.id = ?
            GROUP BY p.id
        `;

        const [payments] = await promisePool.query(query, [id]);

        if (payments.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Payment not found'
            });
        }

        res.json({
            status: 'success',
            data: payments[0]
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch payment details'
        });
    }
});

module.exports = router;
