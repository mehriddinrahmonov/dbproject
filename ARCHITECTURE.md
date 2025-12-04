# Technical Architecture Guide

This document explains how the Concert Ticketing System is built, how the frontend connects to the backend, and how data flows to the database.

## 1. System Overview

The application follows a classic **Client-Server-Database** architecture:

- **Frontend (Client)**: HTML, CSS, and Vanilla JavaScript running in the user's browser.
- **Backend (Server)**: Node.js with Express.js handling API requests.
- **Database**: MySQL storing all persistent data.

## 2. Frontend Architecture

The frontend is built without any heavy frameworks (like React or Vue) to keep it lightweight and easy to understand.

### Key Files
- **`public/index.html`**: The main entry point. It contains the structure of the page.
- **`public/css/style.css`**: Handles all the styling, including the glassmorphism effects and responsive layout.
- **`public/js/app.js`**: Contains core utility functions used across the app (API helpers, formatting functions, modal logic).
- **`public/js/events.js`**: Manages the logic for fetching and displaying events.

### How it Works
1. When the page loads, `events.js` calls `loadEvents()`.
2. This function uses the `apiRequest()` helper from `app.js` to fetch data from the backend.
3. The data is then dynamically inserted into the DOM using JavaScript (creating `div` elements for each event card).

## 3. Backend Architecture

The backend is a RESTful API built with Express.js.

### Key Files
- **`server.js`**: The entry point. It sets up the Express app, middleware (CORS, body-parser), and connects routes.
- **`config/database.js`**: Manages the connection to the MySQL database using a connection pool.
- **`routes/`**: Contains separate files for each resource (e.g., `events.js`, `tickets.js`).

### API Flow
1. **Request**: The frontend sends a `GET /api/events` request.
2. **Routing**: `server.js` directs this request to the `routes/events.js` router.
3. **Handler**: The router executes a SQL query via the database pool.
4. **Response**: The result is formatted as JSON and sent back to the frontend.

## 4. Database Connection

We use the `mysql2` library to connect Node.js to MySQL.

### Connection Pool
Instead of opening a new connection for every request (which is slow), we use a **Connection Pool**.
- The pool maintains a set of open connections.
- When a request comes in, it borrows a connection, runs the query, and releases it back to the pool.

### Security
- **Environment Variables**: Database credentials (password, user) are stored in a `.env` file, not in the code.
- **Prepared Statements**: We use `?` placeholders in SQL queries (e.g., `SELECT * FROM events WHERE id = ?`) to prevent SQL Injection attacks.

## 5. Step-by-Step Data Flow Example

Here is what happens when a user views the events list:

1. **User Action**: User opens the website.
2. **Frontend**: `events.js` runs `fetch('http://localhost:3000/api/events')`.
3. **Network**: The request travels to the Node.js server.
4. **Backend**:
   - Express receives the request.
   - It calls the route handler in `routes/events.js`.
   - The handler runs `pool.query('SELECT * FROM events...')`.
5. **Database**: MySQL executes the query and returns the rows.
6. **Backend**: The server sends the rows back as a JSON response: `{ data: [...] }`.
7. **Frontend**: JavaScript receives the JSON, loops through the events, and creates HTML cards to display them.

## 6. Directory Structure Explained

- **`/public`**: Files served directly to the browser (Client-side).
- **`/routes`**: API endpoints (Server-side logic).
- **`/config`**: Configuration files (Database setup).
- **`/`**: Root files (Server entry point, setup scripts).
