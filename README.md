# 🎟️ Event Management System – PostgreSQL Upgrade

A full-stack Event Management and Ticket Booking System that allows users to register, log in, explore multiple events, view seat availability, and book tickets through an interactive web interface. Administrators can create events and manage the event catalogue. The application uses React for the frontend, Node.js and Express for the backend, and PostgreSQL for database management.

## 🚀 Features

- **User Registration and Login:** Create an account and securely log in.
- **Secure Authentication:** Passwords are hashed and authenticated sessions use JSON Web Tokens (JWT).
- **Multiple Events:** Browse events created and stored in the database.
- **Dynamic Event Selection:** Select an event and view its individual seat layout.
- **Interactive Seat Selection:** Select seats that are available for the chosen event.
- **Seat Availability:** Available and booked seats are shown with distinct visual states.
- **Ticket Booking:** Logged-in users can book available seats.
- **Booking History:** View tickets booked by the currently logged-in user.
- **Admin Dashboard:** Administrators can create new events.
- **Automatic Seat Generation:** Seat records are generated when an administrator creates an event.
- **PostgreSQL Integration:** Store users, events, tickets, and bookings in a hosted PostgreSQL database.
- **REST API:** Connect the frontend and backend through RESTful API endpoints.
- **Cloud Deployment:** Backend and frontend can be deployed separately using Render.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Frontend development server |
| Node.js | Backend runtime |
| Express.js | REST API development |
| PostgreSQL | Relational database management |
| pg | PostgreSQL connection from Node.js |
| JWT | User authentication |
| bcryptjs | Password hashing |
| dotenv | Environment variable management |
| HTML, CSS, JavaScript | Web interface |
| Render | Cloud deployment |

## 📁 Project Structure

```text
Event Management System Upgrade/
│
├── Backend/
│   ├── server.js
│   ├── database.js
│   ├── auth.js
│   ├── authMiddleware.js
│   ├── adminMiddleware.js
│   ├── create_table.sql
│   ├── create_booking_table.sql
│   ├── package.json
│   └── .env
│
├── Frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

**Note:** The `.env` file contains private configuration and must not be committed to GitHub. Add it locally and configure the same environment variables in your hosting provider.

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/anubhavrathi/Event-Management-System-PostgreSQL.git
```

### 2. Navigate to the Project Directory

```bash
cd Event-Management-System-PostgreSQL
```

### 3. Setup the Backend

```bash
cd Backend
npm install
```

Create a `.env` file inside the `Backend` folder and add your PostgreSQL connection string and a strong JWT secret:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_long_random_secret
```

Do not share or upload the real values in this file.

Start the backend:

```bash
npm start
```

The backend server will run locally at:

`http://localhost:5001`

### 4. Setup the Frontend

Open another terminal from the project root:

```bash
cd Frontend
npm install
npm run dev
```

The frontend development server will run at:

`http://localhost:5173`

### 5. Open the Application

Visit `http://localhost:5173` in your browser.

**Configuration:** For local development, configure the frontend API URL to use `http://localhost:5001`. For the deployed application, configure it to use your deployed backend URL.

## 🔗 API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Log in an existing user | Public |
| GET | `/api/events` | Retrieve all events | Public |
| GET | `/api/events/:id/seats` | Retrieve seat availability for an event | Public |
| POST | `/api/admin/events` | Create an event and generate its seats | Admin |
| POST | `/api/bookings` | Book an available seat | Logged-in user |
| GET | `/api/bookings/my-bookings` | Retrieve the logged-in user's bookings | Logged-in user |

Protected endpoints require a valid JWT bearer token. Admin event creation additionally requires an account with the admin role.

## 🗄️ Database

The application uses PostgreSQL and stores information in four main tables:

**1. Events**
- Event ID
- Event Title
- Event Date
- Total Seats

**2. Tickets**
- Ticket ID
- Event ID
- Seat Number
- Booking Status
- User ID associated with a booking

**3. Users**
- User ID
- Name
- Email
- Hashed Password
- Role
- Account Creation Date

**4. Bookings**
- Booking ID
- User ID
- Event ID
- Seat Number
- Booking Date

When an administrator creates an event, the backend automatically generates the required seat records. Each event has its own seat availability.

## ☁️ Deployment

The application can be deployed using Render:

- **Backend:** Deploy the Node.js/Express application as a Web Service.
- **Frontend:** Deploy the Vite application as a Static Site.
- **Database:** Connect the backend to a PostgreSQL database using the `DATABASE_URL` environment variable.

Set `DATABASE_URL` and `JWT_SECRET` in the backend service's environment settings. Configure the frontend API URL to point to the deployed backend.

## 💻 Requirements

- Node.js and npm
- PostgreSQL database
- VS Code or any code editor
- Modern web browser
- macOS, Windows, or Linux

## 🔮 Future Enhancements

- Online payment gateway integration
- Email booking confirmations
- Downloadable e-tickets with QR codes
- Event search, filters, and categories
- Event cancellation and refund management
- Improved booking transaction handling
- Admin analytics and booking reports

## 👨‍💻 Author

**Anubhav Rathi**

BCA Student

## 📄 License

This project is developed for educational and learning purposes.
