
echo "🎵 Concert Ticketing System - Database Setup"
echo "=============================================="
echo ""

read -sp "Enter your MySQL root password (or press Enter to try without password): " MYSQL_PASS
echo ""

if [ -z "$MYSQL_PASS" ]; then
    MYSQL_CMD="mysql -u root"
    echo "Trying without password..."
else
    MYSQL_CMD="mysql -u root -p$MYSQL_PASS"
    echo "Using provided password..."
    # Update .env file
    sed -i '' "s/DB_PASSWORD=.*/DB_PASSWORD=$MYSQL_PASS/" .env
    echo "✅ Updated .env file"
fi

echo ""
echo "Testing MySQL connection..."
if $MYSQL_CMD -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ MySQL connection successful!"
else
    echo "MySQL connection failed!!!!"
    echo ""
    echo "Troubleshooting:"
    echo "1. If you don't know your password, try resetting it:"
    echo "   See MYSQL_PASSWORD_HELP.md for instructions"
    echo ""
    echo "2. Or I can convert this to SQLite (no password needed)"
    echo "   Just let me know!"
    exit 1
fi

# Create database
echo ""
echo "Creating database..."
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS concert_ticketing;" 2>/dev/null
echo "Database created/verified"

# Load schema
echo ""
echo "Loading schema (tables, triggers, views)..."
$MYSQL_CMD concert_ticketing < schema.sql 2>&1 | grep -v "Warning"
echo "Schema loaded"

# Load data
echo ""
echo "Loading sample data..."
$MYSQL_CMD concert_ticketing < data_generator.sql 2>&1 | grep -v "Warning"
echo "Sample data loaded"

# Verify
echo ""
echo "Verification:"
EVENTS=$($MYSQL_CMD concert_ticketing -se "SELECT COUNT(*) FROM events;" 2>/dev/null)
ATTENDEES=$($MYSQL_CMD concert_ticketing -se "SELECT COUNT(*) FROM attendees;" 2>/dev/null)
TICKETS=$($MYSQL_CMD concert_ticketing -se "SELECT COUNT(*) FROM tickets;" 2>/dev/null)

echo "  ✓ Events: $EVENTS"
echo "  ✓ Attendees: $ATTENDEES"  
echo "  ✓ Tickets: $TICKETS"

echo ""
echo "=============================================="
echo "Setup complete!"
echo ""
echo "Start the server:"
echo "  npm start"
echo ""
echo "Then open: http://localhost:3000"
