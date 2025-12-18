const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend files

// Helper to read DB
const readDB = () => {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Database read error:", err);
        return { users: [], events: [], vendors: [], tasks: [], stats: {} };
    }
};

// Helper to write DB
const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Database write error:", err);
        return false;
    }
};

// --- API ROUTES ---

// Login API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Contact/Email API
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }
    console.log(`[Email Simulation] To: Support | From: ${email} | Msg: ${message}`);
    setTimeout(() => {
        res.json({ success: true, message: "Email sent successfully!" });
    }, 1000);
});

// Get Stats
app.get('/api/stats', (req, res) => {
    const db = readDB();
    res.json(db.stats);
});

// -- EVENTS --
app.get('/api/events', (req, res) => {
    const db = readDB();
    res.json(db.events);
});

app.post('/api/events', (req, res) => {
    const db = readDB();
    const newEvent = { id: Date.now(), ...req.body, status: 'Planning' };
    db.events.push(newEvent);
    db.stats.totalEvents += 1; // Update stats
    res.json({ success: true, event: newEvent });
});

app.delete('/api/events/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    const initialLength = db.events.length;
    db.events = db.events.filter(e => e.id !== id);

    if (db.events.length < initialLength) {
        db.stats.totalEvents = Math.max(0, db.stats.totalEvents - 1);
        writeDB(db);
        res.json({ success: true, message: "Event deleted" });
    } else {
        res.status(404).json({ success: false, message: "Event not found" });
    }
});

app.put('/api/events/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    const index = db.events.findIndex(e => e.id === id);

    if (index !== -1) {
        // Merge existing event with updates
        db.events[index] = { ...db.events[index], ...req.body };
        writeDB(db);
        res.json({ success: true, event: db.events[index] });
    } else {
        res.status(404).json({ success: false, message: "Event not found" });
    }
});

// -- VENDORS --
app.get('/api/vendors', (req, res) => {
    const db = readDB();
    res.json(db.vendors);
});

app.post('/api/vendors', (req, res) => {
    const db = readDB();
    const newVendor = { id: Date.now(), ...req.body, status: 'Active', rating: 5.0 };
    db.vendors.push(newVendor);
    db.stats.activeVendors += 1;
    writeDB(db);
    res.json({ success: true, vendor: newVendor });
});

// -- TASKS --
app.get('/api/tasks', (req, res) => {
    const db = readDB();
    res.json(db.tasks);
});

app.post('/api/tasks', (req, res) => {
    const db = readDB();
    const newTask = { id: Date.now(), ...req.body, status: 'Pending' };
    db.tasks.push(newTask);
    writeDB(db);
    res.json({ success: true, task: newTask });
});

// Global Error Handler (Crash Proofing)
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ success: false, message: "Internal Server Error - System Recovered" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`EventFlow MIS Server running on http://localhost:${PORT}`);
});
