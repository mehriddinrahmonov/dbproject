# Concert Ticketing System 🎵

Event registration and ticketing platform for concerts, built with MySQL and HTML/CSS/JS.

---

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Design](#database-design)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Sample Queries](#sample-queries)

---

## ✨ Features

### Core Features
- **Event Management**: Browse and search concerts across multiple genres.
- **Ticket Booking**: Reserve and purchase tickets with multiple ticket types (VIP, General Admission, Early Bird).
- **Promo Codes**: Apply discount codes for reduced ticket prices.
- **Organizer Dashboard**: View sales analytics, revenue reports, and event management.
- **Real-time Seat Availability**: Dynamic seat tracking to prevent overbooking.
- **Payment Processing**: Secure payment handling with transaction records.

### Additional Features
- **Analytics Dashboard**: Revenue by genre, sales trends, and performance metrics.
- **Premium UI Design**: Modern, concert-themed interface with glassmorphism effects.

---

## 🛠 Technology Stack

### Database
- **MySQL 8.0+**: Relational database with triggers, views, and constraints.
- **Normalization**: Schema designed to 3NF/BCNF.

### Backend
- **Node.js**: Runtime environment.
- **Express.js**: RESTful API framework.
- **mysql2**: MySQL database driver with connection pooling.

### Frontend
- **HTML5**: Semantic markup.
- **CSS3**: Modern styling with CSS Grid, Flexbox, gradients, and animations.
- **JavaScript**: Pure ES6+ JavaScript.

---

## 📊 Database Design

### Entity-Relationship Model

The database consists of **9 normalized tables**:

1. **organizers** - Concert promoters and event companies.
2. **venues** - Concert halls, arenas, stadiums.
3. **events** - Individual concert events.
4. **ticket_types** - Different ticket categories per event.
5. **attendees** - Customers.
6. **tickets** - Individual ticket purchases.
7. **payments** - Transaction records with promo code support.
8. **payment_tickets** - Junction table for M:N relationship.
9. **promo_codes** - Promotional discount codes.

### Key Relationships

- **1:N**: Organizer → Events, Venue → Events, Event → Ticket Types.
- **M:N**: Payments ↔ Tickets (via payment_tickets junction table).
- **Optional**: Promo Code → Payments.

---

## 🚀 Installation & Setup

### Prerequisites

- **MySQL 8.0+**
- **Node.js 16+**

### Step 1: Clone the Project

```bash
git clone https://github.com/mehriddinrahmonov/dbproject.git
cd dbproject
```

### Step 2: Set Up MySQL Database

1. **Start MySQL Server**
2. **Create Database**
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE concert_ticketing;
   exit;
   ```
3. **Run Schema Script**
   ```bash
   mysql -u root -p concert_ticketing < schema.sql
   ```
4. **Load Sample Data**
   ```bash
   mysql -u root -p concert_ticketing < data_generator.sql
   ```

---

## 🎯 Running the Application

### Start the Server

```bash
npm start
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Organizer Dashboard**: http://localhost:3000/organizers.html

---

## 📡 API Documentation

### Base URL: `/api`

### Events Endpoints
- `GET /events` - List all concerts.
- `GET /events/:id` - Get event details.
- `GET /events/meta/categories` - Get available genres.

### Tickets Endpoints
- `GET /tickets/availability/:eventId` - Check available seats.
- `POST /tickets/reserve` - Reserve tickets.
- `GET /tickets/my-tickets/:attendeeId` - Get user's tickets.

### Payments Endpoints
- `POST /payments/process` - Process payment.
- `POST /payments/validate-promo` - Validate promo code.

### Organizers Endpoints
- `GET /organizers` - List all organizers.
- `GET /organizers/:id/dashboard` - Get dashboard analytics.

---

## 📁 Project Structure

```
concert-ticketing-system/
├── config/          # Database configuration
├── routes/          # API routes
├── public/          # Frontend assets (HTML/CSS/JS)
├── schema.sql       # Database schema
├── data_generator.sql # Sample data
├── queries.sql      # Sample SQL queries
└── server.js        # Express server entry point
```

---

## 🔍 Sample Queries

The project includes comprehensive queries in `queries.sql` such as:
- Top 10 Concerts by Ticket Sales
- Fully Booked Events
- Revenue per Organizer
- Daily Sales Trends

To run them:
```bash
mysql -u root -p concert_ticketing < queries.sql
```

---

