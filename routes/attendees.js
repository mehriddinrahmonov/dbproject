const express = require('express');
const router = express.Router();
const { promisePool } = require('../config/database');

router.post('/', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, dateOfBirth } = req.body;

        if (!firstName || !lastName || !email) {
            return res.status(400).json({
                status: 'error',
                message: 'First name, last name, and email are required'
            });
        }

        const [result] = await promisePool.query(
            `INSERT INTO attendees (first_name, last_name, email, phone, date_of_birth)
             VALUES (?, ?, ?, ?, ?)`,
            [firstName, lastName, email, phone || null, dateOfBirth || null]
        );

        res.status(201).json({
            status: 'success',
            message: 'Attendee created successfully',
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                status: 'error',
                message: 'Email already registered'
            });
        }
        console.error('Error creating attendee:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create attendee'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [attendees] = await promisePool.query(
            `SELECT * FROM attendees WHERE id = ?`,
            [id]
        );

        if (attendees.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Attendee not found'
            });
        }

        res.json({
            status: 'success',
            data: attendees[0]
        });
    } catch (error) {
        console.error('Error fetching attendee:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch attendee'
        });
    }
});

router.get('/email/:email', async (req, res) => {
    try {
        const { email } = req.params;

        const [attendees] = await promisePool.query(
            `SELECT * FROM attendees WHERE email = ?`,
            [email]
        );

        if (attendees.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Attendee not found'
            });
        }

        res.json({
            status: 'success',
            data: attendees[0]
        });
    } catch (error) {
        console.error('Error fetching attendee:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch attendee'
        });
    }
});

module.exports = router;
