
const express = require('express');
const cors = require('cors');
const db = require('./database');
const authRoutes = require('./auth');
const authenticateToken = require('./authMiddleware');
const adminMiddleware = require('./adminMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);


 // Get all events
app.get('/api/events', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, title, date, total_seats
             FROM events
             ORDER BY date ASC`
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Fetch events error:', err);
        res.status(500).json({
            error: 'Failed to fetch events'
        });
    }
});

// Fetch all seat statuses
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
        res.status(500).json({
            error: 'Failed to fetch seats'
        });
    }
});



// Admin: Create a new event
app.post(
    '/api/admin/events',
    authenticateToken,
    adminMiddleware,
    async (req, res) => {
        const { title, date, total_seats } = req.body;

        if (!title || !date || !Number.isInteger(total_seats) || total_seats <= 0) {
            return res.status(400).json({
                error: 'Valid event title, date and total seats are required'
            });
        }

        const client = await db.connect();

        try {
            await client.query('BEGIN');

            const eventResult = await client.query(
                `INSERT INTO events (title, date, total_seats)
                 VALUES ($1, $2, $3)
                 RETURNING id, title, date, total_seats`,
                [title.trim(), date, total_seats]
            );

            const event = eventResult.rows[0];

            await client.query(
                `INSERT INTO tickets (event_id, seat_number, status)
                 SELECT $1, generate_series(1, $2), 'available'`,
                [event.id, total_seats]
            );

            await client.query('COMMIT');

            res.status(201).json({
                message: 'Event created successfully!',
                event
            });

        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Create event error:', err);

            res.status(500).json({
                error: 'Failed to create event'
            });

        } finally {
            client.release();
        }
    }
);


// Endpoint 2: Get booking history for logged-in user
app.get('/api/bookings/my-bookings', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT
                t.seat_number,
                t.event_id,
                t.status,
                e.title AS event_title,
                e.date AS event_date
             FROM tickets t
             JOIN events e ON t.event_id = e.id
             WHERE t.user_id = $1
             AND t.status = 'booked'
             ORDER BY t.seat_number ASC`,
            [req.user.id]
        );

        res.json(result.rows);

    } catch (err) {
        console.error('Booking history error:', err);
        res.status(500).json({
            error: 'Failed to fetch booking history'
        });
    }
});

// Endpoint 2: Book a seat safely
app.post('/api/bookings', authenticateToken, async (req, res) => {
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
             SET status = 'booked', user_id = $3
             WHERE event_id = $1
             AND seat_number = $2
             AND status = 'available'
             RETURNING seat_number`,
            [event_id, seat_number, req.user.id]
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

        const bookingResult = await db.query(
    `INSERT INTO bookings (user_id, event_id, seat_number)
     VALUES ($1, $2, $3)
     RETURNING id, booking_date`,
    [req.user.id, event_id, seat_number]
);

const booking = bookingResult.rows[0];

res.json({
    message: `Seat ${seat_number} reserved successfully!`,
    booking: {
        booking_id: booking.id,
        event_id: event_id,
        seat_number: seat_number,
        booking_date: booking.booking_date
    }
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
