const pool = require('./db.js');

async function testDB() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        console.log('✅ Database connection successful:', rows[0].solution);
        
        const [tables] = await pool.query('SHOW TABLES');
        console.log('📊 Tables in database:', tables.map(t => Object.values(t)[0]));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testDB();
