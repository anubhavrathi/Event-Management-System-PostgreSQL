
import { useEffect, useState } from 'react';

const API_URL = "https://event-management-system-postgresql.onrender.com";

export default function App() {
  const [seats, setSeats] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(1);
  const [statusMessage, setStatusMessage] = useState('');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isLogin, setIsLogin] = useState(true);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [totalSeats, setTotalSeats] = useState(20); 
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Fetch seats
  const syncSeatingData = () => {
    fetch(`${API_URL}/api/events/${selectedEventId}/seats`)
      .then((res) => res.json())
      .then((data) => setSeats(data))
      .catch((err) => console.error('Seat loading error:', err));
  };

  // Fetch all events
const fetchEvents = async () => {
    try {
        const response = await fetch(`${API_URL}/api/events`);
        const data = await response.json();

        if (response.ok) {
            setEvents(data);
        }
    } catch (error) {
        console.error('Events loading error:', error);
    }
};

  const fetchBookingHistory = async (authToken) => {
    try {
        const response = await fetch(`${API_URL}/api/bookings/my-bookings`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            setStatusMessage(data.error || 'Failed to load booking history');
            return;
        }

        setBookingHistory(data);

    } catch (err) {
        console.error('Booking history error:', err);
    }
};

  useEffect(() => {
    fetchEvents();
}, []);

useEffect(() => {
    syncSeatingData();
}, [selectedEventId]);

  // Register or login
  const handleAuth = async (e) => {
    e.preventDefault();
    setStatusMessage('');

    const endpoint = isLogin ? 'login' : 'register';

    const payload = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(data.error || 'Authentication failed');
        return;
      }

      setToken(data.token);
      setUser(data.user);
      setStatusMessage(data.message);
      fetchBookingHistory(data.token);

      setName('');
      setEmail('');
      setPassword('');

    } catch (err) {
      console.error('Authentication error:', err);
      setStatusMessage('Unable to connect to server');
    }
  };

const handleCreateEvent = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch(`${API_URL}/api/admin/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                title: eventTitle,
                date: eventDate,
                total_seats: Number(totalSeats)
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setStatusMessage(data.error || 'Failed to create event');
            return;
        }

        setStatusMessage('Event created successfully!');
        await fetchEvents();
        setEventTitle('');
        setEventDate('');
        setTotalSeats(20);
        setShowAdminForm(false);

    } catch (error) {
        console.error('Create event error:', error);
        setStatusMessage('Unable to connect to the server');
    }
};

  // Logout
  const handleLogout = () => {
    setUser(null);
    setToken('');
    setStatusMessage('You have logged out successfully.');
  };

  // Book a seat
  const triggerSeatReservation = (seatNumber) => {
    fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        event_id: selectedEventId,
        seat_number: seatNumber,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatusMessage(data.error);
        } else {
          setStatusMessage(data.message);
          setBookingConfirmation(data.booking);
          syncSeatingData();
          fetchBookingHistory(token);
        }
      })
      .catch((err) => console.error('Booking error:', err));
  };

  // Authentication screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center px-4 font-sans">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">

          <h1 className="text-3xl font-extrabold text-center mb-2">
            EventPro
          </h1>

          <p className="text-gray-400 text-center mb-8">
            Rock Concert 2026 Ticket Booking
          </p>

          <div className="flex mb-6 bg-gray-900 rounded-lg p-1">
            <button
              onClick={() => {
                setIsLogin(true);
                setStatusMessage('');
              }}
              className={`flex-1 py-2 rounded-md font-semibold ${
                isLogin ? 'bg-indigo-600' : 'text-gray-400'
              }`}
            >
              Login
            </button>

            <button
              onClick={() => {
                setIsLogin(false);
                setStatusMessage('');
              }}
              className={`flex-1 py-2 rounded-md font-semibold ${
                !isLogin ? 'bg-indigo-600' : 'text-gray-400'
              }`}
            >
              Register
            </button>
          </div>

          {statusMessage && (
            <div className="mb-5 p-3 bg-gray-700 rounded-lg text-sm text-center">
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">

            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 outline-none focus:border-indigo-500"
              />
            )}

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 outline-none focus:border-indigo-500"
            />

            <input
              type="password"
              placeholder="Password (minimum 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600 outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition"
            >
              {isLogin ? 'Login' : 'Create Account'}
            </button>

          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            Secure authentication powered by PostgreSQL and JWT
          </p>
        </div>
      </div>
    );
  }

  // Seat booking dashboard
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-10 px-4 font-sans">

      <div className="w-full max-w-3xl flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>
      </div>

      <h2 className="text-3xl font-extrabold mb-1">

        <select
    value={selectedEventId}
    onChange={(e) => setSelectedEventId(Number(e.target.value))}
    className="p-2 rounded-lg border border-gray-300 text-black mb-4"
>
    {events.map((event) => (
        <option key={event.id} value={event.id}>
            {event.title}
        </option>
    ))}
</select>

    {events.find(event => Number(event.id) === Number(selectedEventId))?.title || 'Select an Event'}
      </h2>

      {user && user.role === 'admin' && (
    <button
        onClick={() => setShowAdminForm(!showAdminForm)}
        className="mb-6 bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg font-semibold"
    >
        {showAdminForm ? 'Close Admin Panel' : 'Admin Dashboard'}
    </button>
)}

      <p className="text-gray-400 mb-6 text-sm">
        Interactive Live Ticketing Dashboard
      </p>

      {showAdminForm && (
    <form
        onSubmit={handleCreateEvent}
        className="w-full max-w-3xl mb-8 bg-gray-800 border border-indigo-500 rounded-xl p-6 space-y-4"
    >
        <h3 className="text-xl font-bold text-indigo-400">
            Create New Event
        </h3>

        <input
            type="text"
            placeholder="Event Title"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600"
        />

        <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600"
        />

        <input
            type="number"
            placeholder="Total Seats"
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
            min="1"
            required
            className="w-full p-3 rounded-lg bg-gray-900 border border-gray-600"
        />

        <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-lg font-bold"
        >
            Create Event
        </button>
    </form>
)}

      {statusMessage && (
        <div className="mb-6 px-4 py-2 bg-indigo-600 text-sm font-semibold rounded">
          {statusMessage}
        </div>
      )}{bookingConfirmation && (
  <div className="w-full max-w-3xl mb-8 bg-gray-800 border border-emerald-500 rounded-xl p-6">
    <h3 className="text-xl font-bold text-emerald-400 mb-4">
      Ticket Booking Confirmed!
    </h3>

    <p className="text-gray-300 mb-2">
      Booking ID: <span className="font-bold text-white">
        #{bookingConfirmation.booking_id}
      </span>
    </p>

    <p className="text-gray-300 mb-2">
      Seat Number: <span className="font-bold text-white">
        {bookingConfirmation.seat_number}
      </span>
    </p>

    <p className="text-gray-300">
      Booking Date: <span className="font-bold text-white">
        {new Date(bookingConfirmation.booking_date).toLocaleString()}
      </span>
    </p>
  </div>
)}

      <div className="w-72 h-8 bg-gray-700 rounded-b-xl mb-12 text-center text-xs pt-2 font-bold tracking-widest text-gray-400">
        STAGE AREA
      </div>

      <div className="grid grid-cols-8 gap-3 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
        {seats.map((seat) => (
          <button
            key={seat.seat_number}
            onClick={() => triggerSeatReservation(seat.seat_number)}
            disabled={seat.status === 'booked'}
            className={`w-11 h-11 rounded-lg font-bold text-xs transition ${
              seat.status === 'booked'
                ? 'bg-red-500 text-white cursor-not-allowed opacity-90'
                : 'bg-emerald-500 text-gray-900 hover:bg-emerald-400'
            }`}
          >
            {seat.seat_number}
          </button>
        ))}
      </div>

      <div className="flex gap-6 mt-8 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
          Available
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-sm"></span>
          Booked
        </div>
      </div>
            {/* Booking History */}
      <div className="w-full max-w-3xl mt-10 bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">My Booking History</h3>

        {bookingHistory.length === 0 ? (
          <p className="text-gray-400 text-sm">
            You haven't booked any seats yet.
          </p>
        ) : (
          <div className="space-y-3">
            {bookingHistory.map((booking) => (
              <div
                key={booking.event_id + '-' + booking.seat_number}
                className="flex justify-between items-center bg-gray-900 p-4 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{booking.event_title}</p>
                  <p className="text-gray-400 text-sm">
                    Seat Number: {booking.seat_number}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Date: {new Date(booking.event_date).toLocaleDateString()}
                  </p>
                </div>

                <span className="text-emerald-400 text-sm font-semibold">
                  Booked
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
