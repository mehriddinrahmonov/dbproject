#!/bin/bash
# Automated MySQL Password Reset and Database Setup

echo "🔧 Resetting MySQL password..."

# Start MySQL in safe mode
mysqld_safe --skip-grant-tables --skip-networking &
SAFE_PID=$!

# Wait for MySQL to start
sleep 5

# Reset password
mysql -u root <<EOF
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
EOF

# Kill safe mode MySQL
kill $SAFE_PID 2>/dev/null
killall mysqld 2>/dev/null
sleep 2

echo "✅ Password reset complete"

# Start MySQL normally
brew services start mysql
sleep 5

# Create database and load data
echo "📦 Setting up database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS concert_ticketing;"
mysql -u root concert_ticketing < schema.sql
mysql -u root concert_ticketing < data_generator.sql

echo "✅ Database setup complete!"

# Verify
EVENTS=$(mysql -u root concert_ticketing -se "SELECT COUNT(*) FROM events;")
echo "✓ Loaded $EVENTS events"

echo ""
echo "🎉 All done! Starting server..."
npm start
