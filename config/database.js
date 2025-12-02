// ================================================================
// Database Connection Configuration
// MySQL connection pool for the Concert Ticketing System
// ================================================================

const mysql = require('mysql2');
require('dotenv').config();

// Create connection pool for better performance
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'concert_ticketing',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Promise-based pool for async/await usage
const promisePool = pool.promise();

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.error('Make sure MySQL server is running');
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Check your database credentials in .env file');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('Database does not exist. Run schema.sql to create it');
        }
        return;
    }
    
    if (connection) {
        console.log('✅ Connected to MySQL database successfully');
        connection.release();
    }
});

module.exports = { pool, promisePool };
