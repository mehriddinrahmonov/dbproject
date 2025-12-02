# MySQL Root Password Setup

## The Issue
Your MySQL root user has a password set. You need to either:
1. Use the existing password
2. Reset the password

---

## Option 1: If you know your MySQL password

Update the `.env` file with your password:

```bash
# Edit .env file
nano .env
```

Change this line:
```
DB_PASSWORD=
```

To:
```
DB_PASSWORD=your_actual_password
```

Then run the setup:
```bash
./setup-db.sh
# Enter your password when prompted
```

---

## Option 2: Reset MySQL Root Password (Recommended for fresh install)

### Step 1: Stop MySQL
```bash
brew services stop mysql
```

### Step 2: Start MySQL in safe mode (skip grant tables)
```bash
mysqld_safe --skip-grant-tables &
```

### Step 3: In a new terminal, reset password
```bash
mysql -u root

# In MySQL prompt, run:
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '';
FLUSH PRIVILEGES;
exit;
```

### Step 4: Kill the safe mode MySQL
```bash
killall mysqld
```

### Step 5: Restart MySQL normally
```bash
brew services start mysql
sleep 5
```

### Step 6: Test connection (should work with no password)
```bash
mysql -u root -e "SELECT 'Connected!' as status;"
```

### Step 7: Run setup script
```bash
./setup-db.sh
# Just press Enter when asked for password
```

---

## Option 3: Quick Alternative - Use SQLite (No Password Needed)

If MySQL is too much hassle, I can quickly convert the project to use SQLite instead (no password, no server setup needed). Just let me know!

---

## After Password is Fixed

Run the setup:
```bash
./setup-db.sh
npm start
```

Then open: http://localhost:3000
