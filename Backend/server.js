
const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint 1: Fetch all seat statuses
app.get('/api/events/:id/seats', async (req, res) => {
    try {
        const eventId = req.params.id;

        const result = await db.query(
            `SELECT seat_number, status
             FROM tickets
             WHERE event_id = $1
             ORDER BY seat_number ASC`,
            [eventId]
        );

        res.json(result.rows);

    } catch (err) {
        console.error('Error fetching seats:', err);
        res.status(500).json({ error: 'Failed to fetch seats' });
    }
});

// Endpoint 2: Book a seat safely
app.post('/api/bookings', async (req, res) => {
    try {
        const { event_id, seat_number } = req.body;

        if (!event_id || !seat_number) {
            return res.status(400).json({
                error: 'Event ID and seat number are required'
            });
        }

        // Atomically book only an available seat
        const result = await db.query(
            `UPDATE tickets
             SET status = 'booked'
             WHERE event_id = $1
             AND seat_number = $2
             AND status = 'available'
             RETURNING seat_number`,
            [event_id, seat_number]
        );

        if (result.rowCount === 0) {
            const check = await db.query(
                `SELECT status FROM tickets
                 WHERE event_id = $1 AND seat_number = $2`,
                [event_id, seat_number]
            );

            if (check.rowCount === 0) {
                return res.status(404).json({
                    error: 'Seat configuration not found'
                });
            }

            return res.status(400).json({
                error: `Seat ${seat_number} is already booked!`
            });
        }

        res.json({
            message: `Seat ${seat_number} reserved successfully!`
        });

    } catch (err) {
        console.error('Booking error:', err.message);
        res.status(500).json({ error: 'Booking failed' });
    }
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
