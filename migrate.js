const fs = require('fs');
const path = require('path');
const db = require('./db');

const DB_FILE = path.join(__dirname, 'data', 'db.json');

async function migrate() {
    console.log("Starting migration from JSON to MySQL...");

    if (!fs.existsSync(DB_FILE)) {
        console.error("Source db.json not found!");
        process.exit(1);
    }

    try {
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

        // 1. Migrate Users
        console.log("Migrating users...");
        for (const user of data.users) {
            await db.query(
                'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), password=VALUES(password), role=VALUES(role)',
                [user.id, user.name, user.email, user.password, user.role]
            );
        }

        // 2. Migrate Events
        console.log("Migrating events...");
        for (const event of data.events) {
            await db.query(
                'INSERT INTO events (id, name, date, location, budget, status) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), date=VALUES(date), location=VALUES(location), budget=VALUES(budget), status=VALUES(status)',
                [event.id, event.name, event.date, event.location, event.budget, event.status]
            );
        }

        // 3. Migrate Vendors
        console.log("Migrating vendors...");
        for (const vendor of data.vendors) {
            await db.query(
                'INSERT INTO vendors (id, name, category, contact, status, rating) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), contact=VALUES(contact), status=VALUES(status), rating=VALUES(rating)',
                [vendor.id, vendor.name, vendor.category, vendor.contact, vendor.status, vendor.rating]
            );
        }

        // 4. Migrate Tasks
        console.log("Migrating tasks...");
        for (const task of (data.tasks || [])) {
            await db.query(
                'INSERT INTO tasks (id, description, assignedTo, deadline, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE description=VALUES(description), assignedTo=VALUES(assignedTo), deadline=VALUES(deadline), status=VALUES(status)',
                [task.id, task.description, task.assignedTo, task.deadline, task.status]
            );
        }

        // 5. Migrate Stats
        console.log("Migrating stats...");
        if (data.stats) {
            await db.query(
                'INSERT INTO stats (id, totalEvents, totalAttendees, totalRevenue, activeVendors) VALUES (1, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE totalEvents=VALUES(totalEvents), totalAttendees=VALUES(totalAttendees), totalRevenue=VALUES(totalRevenue), activeVendors=VALUES(activeVendors)',
                [data.stats.totalEvents || 0, data.stats.totalAttendees || 0, data.stats.totalRevenue || 0, data.stats.activeVendors || 0]
            );
        }

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

migrate();
