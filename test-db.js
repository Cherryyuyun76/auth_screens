// test-db-debug.js
require('dotenv').config();
const db = require('./db');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const [rows] = await db.query('SELECT 1 + 1 AS result, NOW() as time');
    console.log('✅ Database connection successful:', rows);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    return false;
  }
}

testConnection();