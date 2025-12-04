# Quick Start Guide

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

## Step 3: Start the Application

```bash
npm start
```

## Step 4: Open in Browser

Go to: **http://localhost:3000**

