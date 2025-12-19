const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'ilovemyfamily'
    });

    console.log("Connecting to MySQL...");

    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const queries = sql.split(';').filter(q => q.trim() !== '');

    console.log("Running schema.sql...");
    for (const query of queries) {
        try {
            await connection.query(query);
        } catch (err) {
            console.error("Error executing query:", query);
            console.error(err);
        }
    }

    console.log("Database setup completed.");
    await connection.end();
}

setup().catch(console.error);
