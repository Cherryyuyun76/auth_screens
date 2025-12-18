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
    const { name, date, location, budget } = req.body;
    if (!name || !date || !location) {
        return res.status(400).json({ success: false, message: "Required fields missing: name, date, or location" });
    }

    const db = readDB();
    const newEvent = {
        id: Date.now(),
        name: String(name),
        date: String(date),
        location: String(location),
        budget: Number(budget) || 0,
        status: 'Planning'
    };
    db.events.push(newEvent);
    db.stats.totalEvents = (db.stats.totalEvents || 0) + 1;
    writeDB(db);
    res.json({ success: true, message: "Event Added Successfully", event: newEvent });
});

app.delete('/api/events/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid ID" });

    console.log(`[DELETE Event] ID: ${id}`);
    const initialLength = db.events.length;
    db.events = db.events.filter(e => Number(e.id) !== id);

    if (db.events.length < initialLength) {
        db.stats.totalEvents = Math.max(0, (db.stats.totalEvents || 1) - 1);
        writeDB(db);
        res.json({ success: true, message: "Event Deleted Successfully" });
    } else {
        res.status(404).json({ success: false, message: "Event not found" });
    }
});

app.put('/api/events/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid ID" });

    console.log(`[UPDATE Event] ID: ${id}`);
    const index = db.events.findIndex(e => Number(e.id) === id);

    if (index !== -1) {
        const { name, date, location, budget } = req.body;
        db.events[index] = {
            ...db.events[index],
            name: name ? String(name) : db.events[index].name,
            date: date ? String(date) : db.events[index].date,
            location: location ? String(location) : db.events[index].location,
            budget: budget !== undefined ? Number(budget) : db.events[index].budget
        };
        writeDB(db);
        res.json({ success: true, message: "Event Updated Successfully", event: db.events[index] });
    } else {
        res.status(404).json({ success: false, message: "Event not found" });
    }
});

// -- VENDORS --
app.get('/api/vendors', (req, res) => {
    const db = readDB();
    res.json(db.vendors || []);
});

app.post('/api/vendors', (req, res) => {
    const { name, category, contact } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Vendor name is required" });

    const db = readDB();
    const newVendor = {
        id: Date.now(),
        name: String(name),
        category: String(category || 'General'),
        contact: String(contact || 'N/A'),
        status: 'Active',
        rating: 5.0
    };
    db.vendors.push(newVendor);
    db.stats.activeVendors = (db.stats.activeVendors || 0) + 1;
    writeDB(db);
    res.json({ success: true, message: "Vendor Added Successfully", vendor: newVendor });
});

// -- TASKS --
app.get('/api/tasks', (req, res) => {
    const db = readDB();
    res.json(db.tasks || []);
});

app.post('/api/tasks', (req, res) => {
    const { description } = req.body;
    if (!description) return res.status(400).json({ success: false, message: "Task description is required" });

    const db = readDB();
    const newTask = {
        id: Date.now(),
        ...req.body,
        description: String(description),
        status: 'Pending'
    };
    db.tasks.push(newTask);
    writeDB(db);
    res.json({ success: true, message: "Task Added Successfully", task: newTask });
});

app.put('/api/vendors/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid ID" });

    console.log(`[UPDATE Vendor] ID: ${id}`);
    const index = db.vendors.findIndex(v => Number(v.id) === id);

    if (index !== -1) {
        db.vendors[index] = { ...db.vendors[index], ...req.body };
        writeDB(db);
        res.json({ success: true, message: "Vendor Updated Successfully", vendor: db.vendors[index] });
    } else {
        res.status(404).json({ success: false, message: "Vendor not found" });
    }
});

app.put('/api/tasks/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid ID" });

    console.log(`[UPDATE Task] ID: ${id}`);
    const index = db.tasks.findIndex(t => Number(t.id) === id);

    if (index !== -1) {
        db.tasks[index] = { ...db.tasks[index], ...req.body };
        writeDB(db);
        res.json({ success: true, message: "Task Updated Successfully", task: db.tasks[index] });
    } else {
        res.status(404).json({ success: false, message: "Task not found" });
    }
});

app.delete('/api/vendors/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    console.log(`[DELETE Vendor] ID: ${id}`);
    const initialLength = db.vendors.length;
    db.vendors = db.vendors.filter(v => v.id !== id);

    if (db.vendors.length < initialLength) {
        db.stats.activeVendors = Math.max(0, db.stats.activeVendors - 1);
        writeDB(db);
        res.json({ success: true, message: "Vendor Deleted Successfully" });
    } else {
        res.status(404).json({ success: false, message: "Vendor not found" });
    }
});

app.delete('/api/tasks/:id', (req, res) => {
    const db = readDB();
    const id = Number(req.params.id);
    console.log(`[DELETE Task] ID: ${id}`);
    const initialLength = db.tasks.length;
    db.tasks = db.tasks.filter(t => t.id !== id);

    if (db.tasks.length < initialLength) {
        writeDB(db);
        res.json({ success: true, message: "Task Deleted Successfully" });
    } else {
        res.status(404).json({ success: false, message: "Task not found" });
    }
});

// Global Error Handler (Crash Proofing)
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ success: false, message: "Internal Server Error - System Recovered" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`EventFlow MIS Server running on port ${PORT}`);
});
