const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: [process.env.FRONTEND_URL || "http://localhost:5173", "https://your-site.netlify.app"], credentials: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// --- HEALTH CHECK (FOR RAILWAY/RENDER) ---
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'EventFlow MIS API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EventFlow MIS API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'EventFlow MIS API',
    version: '1.0.0',
    health: '/api/health',
    endpoints: [
      '/api/login', 
      '/api/register', 
      '/api/contact',
      '/api/events',
      '/api/vendors',
      '/api/tasks',
      '/api/stats'
    ]
  });
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <!-- Your entire landing page HTML here -->
    </html>
  `);
});

// --- DATABASE MIGRATION COMPLETED ---
// Using MySQL instead of db.json

// --- API ROUTES ---

// Login API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`[Auth] Login attempt for: ${email}`);
    try {
        const [rows] = await db.query('SELECT id, name, role FROM users WHERE email = ? AND password = ?', [email, password]);
        const user = rows[0];

        if (user) {
            console.log(`[Auth] Login success: ${email}`);
            res.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
        } else {
            console.log(`[Auth] Login failed: ${email} (Invalid credentials)`);
            res.status(401).json({ success: false, message: "Invalid credentials" });
        }
    } catch (err) {
        console.error("[Auth] Database error during login:", err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// Register API
app.post('/api/register', async (req, res) => {
    const { email, password, name } = req.body;
    const userName = name || email.split('@')[0];
    console.log(`[Auth] Registration attempt for: ${email}`);

    try {
        // Check if user exists
        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const [result] = await db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [userName, email, password, 'admin']);

        console.log(`[Auth] Registration success: ${email}`);
        res.json({ success: true, user: { id: result.insertId, name: userName, role: 'admin' } });
    } catch (err) {
        console.error("[Auth] Database error during registration:", err);
        res.status(500).json({ success: false, message: "Database error" });
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
app.get('/api/stats', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM stats WHERE id = 1');
        res.json(rows[0] || { totalEvents: 0, totalAttendees: 0, totalRevenue: 0, activeVendors: 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// -- EVENTS --
app.get('/api/events', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM events');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.post('/api/events', async (req, res) => {
    const { name, date, location, budget } = req.body;
    if (!name || !date || !location) {
        return res.status(400).json({ success: false, message: "Required fields missing: name, date, or location" });
    }

    try {
        const newEvent = {
            id: Date.now(),
            name: String(name),
            date: String(date),
            location: String(location),
            budget: Number(budget) || 0,
            status: 'Planning'
        };
        await db.query('INSERT INTO events (id, name, date, location, budget, status) VALUES (?, ?, ?, ?, ?, ?)',
            [newEvent.id, newEvent.name, newEvent.date, newEvent.location, newEvent.budget, newEvent.status]);

        await db.query('UPDATE stats SET totalEvents = totalEvents + 1 WHERE id = 1');

        res.json({ success: true, message: "Event Added Successfully", event: newEvent });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.delete('/api/events/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid ID" });

    try {
        const [result] = await db.query('DELETE FROM events WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            await db.query('UPDATE stats SET totalEvents = GREATEST(0, totalEvents - 1) WHERE id = 1');
            res.json({ success: true, message: "Event Deleted Successfully" });
        } else {
            res.status(404).json({ success: false, message: "Event not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.put('/api/events/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid ID" });

    const { name, date, location, budget } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE events SET name = COALESCE(?, name), date = COALESCE(?, date), location = COALESCE(?, location), budget = COALESCE(?, budget) WHERE id = ?',
            [name || null, date || null, location || null, budget !== undefined ? Number(budget) : null, id]
        );

        if (result.affectedRows > 0) {
            const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
            res.json({ success: true, message: "Event Updated Successfully", event: rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Event not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// -- VENDORS --
app.get('/api/vendors', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM vendors');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.post('/api/vendors', async (req, res) => {
    const { name, category, contact_person, email, phone, country, description, website } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Vendor name is required" });

    try {
        const newVendor = {
            id: Date.now(),
            name: String(name),
            category: String(category || 'General'),
            contact_person: String(contact_person || 'N/A'),
            email: String(email || ''),
            phone: String(phone || ''),
            country: String(country || 'Cameroon'),
            description: String(description || ''),
            website: String(website || ''),
            status: 'Active',
            rating: 5.0
        };
        await db.query('INSERT INTO vendors (id, name, category, contact_person, email, phone, country, description, website, status, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newVendor.id, newVendor.name, newVendor.category, newVendor.contact_person, newVendor.email, newVendor.phone, newVendor.country, newVendor.description, newVendor.website, newVendor.status, newVendor.rating]);

        await db.query('UPDATE stats SET activeVendors = activeVendors + 1 WHERE id = 1');

        res.json({ success: true, message: "Vendor Added Successfully", vendor: newVendor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// -- TASKS --
app.get('/api/tasks', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM tasks');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.post('/api/tasks', async (req, res) => {
    const { description, assignedTo, deadline } = req.body;
    if (!description) return res.status(400).json({ success: false, message: "Task description is required" });

    try {
        const newTask = {
            id: Date.now(),
            description: String(description),
            assignedTo: assignedTo || null,
            deadline: deadline || null,
            status: 'Pending'
        };
        await db.query('INSERT INTO tasks (id, description, assignedTo, deadline, status) VALUES (?, ?, ?, ?, ?)',
            [newTask.id, newTask.description, newTask.assignedTo, newTask.deadline, newTask.status]);

        res.json({ success: true, message: "Task Added Successfully", task: newTask });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.put('/api/vendors/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid ID" });

    const { name, category, contact_person, email, phone, country, description, website, status, rating } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE vendors SET name = COALESCE(?, name), category = COALESCE(?, category), contact_person = COALESCE(?, contact_person), email = COALESCE(?, email), phone = COALESCE(?, phone), country = COALESCE(?, country), description = COALESCE(?, description), website = COALESCE(?, website), status = COALESCE(?, status), rating = COALESCE(?, rating) WHERE id = ?',
            [name || null, category || null, contact_person || null, email || null, phone || null, country || null, description || null, website || null, status || null, rating !== undefined ? Number(rating) : null, id]
        );

        if (result.affectedRows > 0) {
            const [rows] = await db.query('SELECT * FROM vendors WHERE id = ?', [id]);
            res.json({ success: true, message: "Vendor Updated Successfully", vendor: rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Vendor not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.put('/api/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid ID" });

    const { description, assignedTo, deadline, status } = req.body;
    try {
        const [result] = await db.query(
            'UPDATE tasks SET description = COALESCE(?, description), assignedTo = COALESCE(?, assignedTo), deadline = COALESCE(?, deadline), status = COALESCE(?, status) WHERE id = ?',
            [description || null, assignedTo || null, deadline || null, status || null, id]
        );

        if (result.affectedRows > 0) {
            const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
            res.json({ success: true, message: "Task Updated Successfully", task: rows[0] });
        } else {
            res.status(404).json({ success: false, message: "Task not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.delete('/api/vendors/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const [result] = await db.query('DELETE FROM vendors WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            await db.query('UPDATE stats SET activeVendors = GREATEST(0, activeVendors - 1) WHERE id = 1');
            res.json({ success: true, message: "Vendor Deleted Successfully" });
        } else {
            res.status(404).json({ success: false, message: "Vendor not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    const id = Number(req.params.id);
    try {
        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Task Deleted Successfully" });
        } else {
            res.status(404).json({ success: false, message: "Task not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Database error" });
    }
});

// Global Error Handler (Crash Proofing)
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ success: false, message: "Internal Server Error - System Recovered" });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: "Endpoint not found",
        availableEndpoints: [
            '/api/health',
            '/api/login',
            '/api/register',
            '/api/events',
            '/api/vendors',
            '/api/tasks',
            '/api/stats',
            '/api/contact'
        ]
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`EventFlow MIS Server running on port ${PORT}`);
    console.log(`Health check available at: http://localhost:${PORT}/api/health`);
});
