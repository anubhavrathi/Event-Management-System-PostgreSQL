
-- 1. Create Events table
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    total_seats INTEGER NOT NULL
);

-- 2. Create Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    seat_number INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    UNIQUE(event_id, seat_number)
);

-- 3. Insert the initial event
INSERT INTO events (id, title, date, total_seats)
VALUES (1, 'Rock Concert 2026', '2026-12-25', 40)
ON CONFLICT (id) DO NOTHING;

-- 4. Synchronize the event ID sequence
SELECT setval(
    pg_get_serial_sequence('events', 'id'),
    GREATEST((SELECT MAX(id) FROM events), 1)
);

-- 5. Generate 40 seats
INSERT INTO tickets (event_id, seat_number, status)
SELECT 1, generate_series(1, 40), 'available'
ON CONFLICT (event_id, seat_number) DO NOTHING;
SELECT * FROM events;
SELECT * FROM tickets;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
