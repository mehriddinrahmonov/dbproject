# Concert Ticketing System 🎵

**CS 301 Fundamentals of Database Systems - Fall 2025**

A comprehensive event registration and ticketing platform for concerts, built with MySQL, Node.js/Express, and modern web technologies.

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
- [Screenshots](#screenshots)
- [Team Contributions](#team-contributions)

---

## ✨ Features

### Core Features
- ✅ **Event Management**: Browse and search 50+ concerts across multiple genres
- ✅ **Ticket Booking**: Reserve and purchase tickets with multiple ticket types (VIP, General Admission, Early Bird)
- ✅ **Promo Codes**: Apply discount codes for reduced ticket prices
- ✅ **Organizer Dashboard**: View sales analytics, revenue reports, and event management
- ✅ **Real-time Seat Availability**: Dynamic seat tracking to prevent overbooking
- ✅ **Payment Processing**: Secure payment handling with transaction records

### Bonus Features (Extra Credit)
- 🎁 **Discount System**: Promotional codes with usage tracking
- 📊 **Analytics Dashboard**: Revenue by genre, sales trends, and performance metrics
- 🎨 **Premium UI Design**: Modern, concert-themed interface with glassmorphism effects
- ⚡ **Real-time Updates**: Live seat availability and booking status

---

## 🛠 Technology Stack

### Database
- **MySQL 8.0+**: Relational database with triggers, views, and constraints
- **Normalization**: Schema designed to 3NF/BCNF

### Backend
- **Node.js**: Runtime environment
- **Express.js**: RESTful API framework
- **mysql2**: MySQL database driver with connection pooling

### Frontend
- **HTML5**: Semantic markup with SEO best practices
- **CSS3**: Modern styling with CSS Grid, Flexbox, gradients, and animations
- **Vanilla JavaScript**: No frameworks, pure ES6+ JavaScript

---

## 📊 Database Design

### Entity-Relationship Model

The database consists of **9 normalized tables**:

1. **organizers** - Concert promoters and event companies
2. **venues** - Concert halls, arenas, stadiums (22 venues)
3. **events** - Individual concert events (50+ events)
4. **ticket_types** - Different ticket categories per event
5. **attendees** - Customers (200+ registered users)
6. **tickets** - Individual ticket purchases (500+ tickets)
7. **payments** - Transaction records with promo code support
8. **payment_tickets** - Junction table for M:N relationship
9. **promo_codes** - Promotional discount codes

### Key Relationships

- **1:N**: Organizer → Events, Venue → Events, Event → Ticket Types
- **M:N**: Payments ↔ Tickets (via payment_tickets junction table)
- **Optional**: Promo Code → Payments

### Constraints & Triggers

- **Foreign Keys**: Cascade delete/update rules
- **CHECK Constraints**: Validate dates, prices, capacities
- **UNIQUE Constraints**: Email addresses, promo codes
- **Triggers**:
  - Auto-increment promo code usage count
  - Validate venue capacity before ticket creation
  - Update ticket type quantity on purchase/cancellation

### Views

- `event_details` - Join events with venues and organizers
- `event_sales_summary` - Aggregate ticket sales per event
- `sales_dashboard` - Daily sales analytics

See [er_diagram.md](../brain/56044f1a-ceee-41af-8aac-f95dd13f37e5/er_diagram.md) for detailed E-R diagram and design decisions.

---

## 🚀 Installation & Setup

### Prerequisites

- **MySQL 8.0+** - [Download MySQL](https://dev.mysql.com/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)

### Step 1: Clone/Download the Project

```bash
cd /path/to/project
cd "untitled folder"
```

### Step 2: Set Up MySQL Database

1. **Start MySQL Server**
   ```bash
   # macOS (if installed via Homebrew)
   brew services start mysql
   
   # Or system-specific MySQL start command
   ```

2. **Create Database**
   ```bash
   mysql -u root -p
   ```
   
   In MySQL:
   ```sql
   CREATE DATABASE concert_ticketing;
   exit;
   ```

3. **Run Schema Script**
   ```bash
   mysql -u root -p concert_ticketing < schema.sql
   ```
   
   This creates all tables, triggers, views, and constraints.

4. **Load Sample Data**
   ```bash
   mysql -u root -p concert_ticketing < data_generator.sql
   ```
   
   This populates the database with:
   - 12 organizers
   - 22 venues
   - 50 concert events
   - 200+ attendees
   - 500+ ticket purchases
   - 5 active promo codes

### Step 3: Configure Backend

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` File**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=concert_ticketing
   DB_PORT=3306
   
   PORT=3000
   NODE_ENV=development
   ```

---

## 🎯 Running the Application

### Start the Server

```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

You should see:
```
================================================
🎵 Concert Ticketing System Server
================================================
✅ Server running on http://localhost:3000
📊 API available at http://localhost:3000/api
🌐 Frontend available at http://localhost:3000
================================================
✅ Connected to MySQL database successfully
```

### Access the Application

- **Frontend**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **Organizer Dashboard**: http://localhost:3000/organizers.html

---

## 📡 API Documentation

### Base URL: `http://localhost:3000/api`

### Events Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List all concerts (with filters) |
| GET | `/events/:id` | Get event details with ticket types |
| GET | `/events/meta/categories` | Get available genres |

**Query Parameters for `/events`:**
- `category` - Filter by music genre (Rock, Pop, Hip-Hop, etc.)
- `status` - Filter by status (upcoming, completed, cancelled)
- `search` - Search in title and description
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset

### Tickets Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tickets/availability/:eventId` | Check available seats |
| POST | `/tickets/reserve` | Reserve tickets |
| GET | `/tickets/my-tickets/:attendeeId` | Get user's tickets |

### Payments Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/process` | Process payment for tickets |
| POST | `/payments/validate-promo` | Validate promo code |
| GET | `/payments/:id` | Get payment details |

### Organizers Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/organizers` | List all organizers |
| GET | `/organizers/:id/dashboard` | Get dashboard analytics |

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/venues` | List all venues |
| GET | `/venues/:id` | Get venue details |
| POST | `/attendees` | Create new attendee |
| GET | `/attendees/:id` | Get attendee by ID |

---

## 📁 Project Structure

```
concert-ticketing-system/
├── config/
│   └── database.js          # MySQL connection configuration
├── routes/
│   ├── events.js            # Event API endpoints
│   ├── tickets.js           # Ticket booking endpoints
│   ├── payments.js          # Payment processing endpoints
│   ├── organizers.js        # Organizer dashboard endpoints
│   ├── attendees.js         # Attendee management endpoints
│   └── venues.js            # Venue endpoints
├── public/
│   ├── css/
│   │   └── style.css        # Modern, concert-themed styles
│   ├── js/
│   │   ├── app.js           # Core utility functions
│   │   └── events.js        # Event listing and booking logic
│   ├── index.html           # Main landing page
│   └── organizers.html      # Organizer dashboard
├── schema.sql               # Database schema with triggers
├── data_generator.sql       # Sample data population
├── queries.sql              # 10 required queries + analytics
├── server.js                # Express server entry point
├── package.json             # Node.js dependencies
├── .env.example             # Environment variables template
└── README.md                # This file
```

---

## 🔍 Sample Queries

The project includes 10+ comprehensive queries in `queries.sql`:

### Required Queries

1. **Top 10 Concerts by Ticket Sales** - Identify most popular events
2. **Fully Booked Events** - Find sold-out concerts (95%+ capacity)
3. **Repeat Customers** - Attendees with multiple ticket purchases
4. **Revenue per Organizer** - Total sales by event company
5. **Popular Venues** - Venues ranked by total ticket sales
6. **Events with No Seats** - Completely sold-out shows
7. **Unpaid Reservations** - Reserved tickets awaiting payment
8. **Daily Sales Trends** - Ticket sales patterns over time

### Bonus Queries (Extra Credit)

9. **Average Price by Genre** - Pricing analysis across music categories
10. **VIP vs General Revenue** - Premium pricing effectiveness
11. **Promo Code Effectiveness** - Discount code usage analytics
12. **Low-Sales Events** - Events needing marketing boost

### Running Queries

```bash
mysql -u root -p concert_ticketing < queries.sql
```

Or execute individual queries in MySQL Workbench / command line.

---

## 🖼 Screenshots

### Landing Page
- Hero section with search and filters
- Event cards with genre, date, venue, and availability
- Modern gradient design with smooth animations

### Event Details Modal
- Complete event information
- Venue details and capacity
- Ticket types with pricing and perks
- One-click ticket selection

### Organizer Dashboard
- Sales statistics (events, tickets, revenue)
- Recent events table
- Revenue breakdown by music genre
- Performance analytics

---

## 👥 Team Contributions

*Note: Update this section with your team member details*

### Team Members

1. **[Your Name]** - [Your Contribution]
   - Database design and E-R modeling
   - MySQL schema implementation
   - SQL queries and optimization

2. **[Team Member 2]** - [Their Contribution]
   - Backend API development
   - Express routing and middleware
   - Database integration

3. **[Team Member 3]** - [Their Contribution]
   - Frontend development
   - UI/UX design
   - JavaScript functionality

### Individual Responsibilities

- **E-R Diagram**: [Name(s)]
- **Database Schema**: [Name(s)]
- **Data Generation**: [Name(s)]
- **SQL Queries**: [Name(s)]
- **Backend API**: [Name(s)]
- **Frontend UI**: [Name(s)]
- **Testing & Documentation**: [Name(s)]

---

## 🎓 Academic Integrity

This project was developed for **CS 301 Fundamentals of Database Systems (Fall 2025)**.

All team members contributed to the project and can explain any component in detail.

---

## 📝 Additional Notes

### Testing Promo Codes

Available promo codes in the database:
- `EARLYBIRD2025` - 20% off (valid Jan-Mar 2025)
- `SUMMER25` - 15% off (valid Jun-Aug 2025)
- `VIP50OFF` - $50 off any ticket
- `STUDENT10` - 10% student discount
- `GROUPBUY` - 25% off for group purchases

### Database Optimization

The schema includes:
- **Indexes** on frequently queried columns (email, event_date, status)
- **Connection pooling** for better performance
- **Prepared statements** to prevent SQL injection
- **Triggers** for automatic business logic enforcement

### Future Enhancements

Potential improvements for bonus credit:
- QR code generation for tickets
- Email notifications for confirmations
- Waitlist functionality for sold-out shows
- Artist entity with M:N relationship to events
- Reviews and ratings system

---

## 📧 Contact

For questions or issues, please contact:
- **Email**: [your.email@example.com]
- **Instructor**: CS 301 Teaching Staff

---

**Built with ❤️ for CS 301 Database Systems Project**

*Demonstrating full-stack database development from conceptual design to working application*
