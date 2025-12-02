# 🚀 Quick Start Guide

## Issue: "Failed to load organizers"

This happens when the database isn't set up yet. Follow these steps:

## Step 1: Start MySQL Server

```bash
brew services start mysql
```

Wait a few seconds for MySQL to start.

## Step 2: Run the Setup Script

```bash
./setup-db.sh
```

This will:
- Create the database
- Load the schema (tables, triggers, views)
- Load sample data (50+ concerts, 200+ attendees)

**Just press Enter when asked for password** (if you haven't set a MySQL root password)

## Step 3: Start the Application

```bash
npm start
```

## Step 4: Open in Browser

Go to: **http://localhost:3000**

---

## Manual Setup (If Script Doesn't Work)

If the setup script has issues, run these commands manually:

```bash
# 1. Create database
mysql -u root -e "CREATE DATABASE concert_ticketing;"

# 2. Load schema
mysql -u root concert_ticketing < schema.sql

# 3. Load data
mysql -u root concert_ticketing < data_generator.sql

# 4. Start server
npm start
```

---

## Troubleshooting

**MySQL not starting?**
```bash
# Check if MySQL is installed
brew list mysql

# If not installed:
brew install mysql

# Then start it:
brew services start mysql
```

**"Access Denied" error?**

If you have a MySQL password, update the `.env` file:
```env
DB_PASSWORD=your_password_here
```

**Port 3000 already in use?**

Change the port in `.env`:
```env
PORT=3001
```

Then access: http://localhost:3001

---

## Testing Promo Codes

Once running, try these promo codes:
- `EARLYBIRD2025` - 20% off
- `VIP50OFF` - $50 off
- `STUDENT10` - 10% discount

## Sample User Email

To view tickets on "My Tickets" page:
- Email: `john.smith@email.com`
