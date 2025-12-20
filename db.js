// db.js - FINAL VERSION
const mysql = require('mysql2/promise');

// Detect if we're running on Railway
const isRailway = process.env.RAILWAY_ENVIRONMENT === 'production' || 
                  process.env.NODE_ENV === 'production';

// Use different host based on environment
let mysqlHost;
if (isRailway) {
  // When deployed on Railway, use internal URL
  mysqlHost = process.env.MYSQLHOST || 'mysql.railway.internal';
} else {
  // When running locally, use PUBLIC Railway URL
  // You need to get this from Railway dashboard!
  mysqlHost = process.env.MYSQLHOST_LOCAL || 'containers-us-west-100.railway.app';
}

const pool = mysql.createPool({
  host: mysqlHost,
  port: process.env.MYSQLPORT || 3306,
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log(`Database configured for: ${isRailway ? 'Railway Production' : 'Local Development'}`);
console.log(`Connecting to host: ${mysqlHost}`);

module.exports = pool;