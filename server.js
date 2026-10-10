const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;
const DB_FILE = path.join(__dirname, 'kampus.db');

// Middleware to parse JSON and serve static frontend files (index.html, style.css, script.js)
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite Database and Seed Data
const db = new sqlite3.Database(DB_FILE, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('📂 Connected to SQLite database: kampus.db');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'client'
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS creators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            rating REAL DEFAULT 5.0,
            reviews INTEGER DEFAULT 0,
            projects INTEGER DEFAULT 0,
            image TEXT NOT NULL,
            avatar TEXT NOT NULL,
            featured INTEGER DEFAULT 0,
            tools TEXT NOT NULL,
            specializations TEXT NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            image TEXT NOT NULL,
            tools TEXT NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS briefs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            brand TEXT NOT NULL,
            description TEXT NOT NULL,
            contentType TEXT NOT NULL,
            visualStyle TEXT NOT NULL,
            aspectRatio TEXT NOT NULL,
            budgetRange TEXT NOT NULL,
            deadline TEXT NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS hire_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            creatorId INTEGER NOT NULL,
            senderName TEXT NOT NULL,
            message TEXT NOT NULL
        )`);

        // Seed Creators if empty
        db.get("SELECT COUNT(*) as count FROM creators", (err, row) => {
            if (row && row.count === 0) {
                const stmt = db.prepare(`INSERT INTO creators (name, role, rating, reviews, projects, image, avatar, featured, tools, specializations) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                stmt.run("Aarav Sharma", "AI Filmmaker", 4.9, 38, 42, 
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", 
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", 
                    1, "Runway,Midjourney,Pika", "AI Filmmaker,Cinematic Video");
                stmt.run("Priya Desai", "AI Animator", 4.8, 29, 31, 
                    "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80", 
                    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80", 
                    1, "Stable Diffusion,ComfyUI,Blender", "AI Animator,3D Animation");
                stmt.run("Marcus Vance", "Generative Artist", 5.0, 52, 64, 
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", 
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", 
                    1, "Midjourney,Photoshop AI,Topaz", "Generative Artist,Generative Art");
                stmt.finalize();
            }
        });

        // Seed Projects if empty
        db.get("SELECT COUNT(*) as count FROM projects", (err, row) => {
            if (row && row.count === 0) {
                const stmt = db.prepare(`INSERT INTO projects (name, type, image, tools) VALUES (?, ?, ?, ?)`);
                stmt.run("Neon Odyssey — Sci-Fi Teaser", "Cinematic Video", "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80", "Runway Gen-3 + Midjourney v6");
                stmt.run("Aura Parfum — Commercial", "Product Advertising", "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80", "Stable Diffusion XL + ComfyUI");
                stmt.finalize();
            }
        });
    });
}

// ==================== API ROUTES ====================

// Get Creators (with filters and search)
app.get('/api/creators', (req, res) => {
    let query = "SELECT * FROM creators WHERE 1=1";
    let params = [];

    if (req.query.featured) {
        query += " AND featured = ?";
        params.push(1);
    }

    if (req.query.q) {
        const searchTerm = `%${req.query.q.trim()}%`;
        query += " AND (name LIKE ? OR tools LIKE ? OR specializations LIKE ? OR role LIKE ?)";
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (req.query.role) {
        const roles = Array.isArray(req.query.role) ? req.query.role : [req.query.role];
        const roleClauses = roles.map(() => "specializations LIKE ?");
        query += ` AND (${roleClauses.join(' OR ')})`;
        roles.forEach(r => params.push(`%${r}%`));
    }

    if (req.query.tool) {
        const tools = Array.isArray(req.query.tool) ? req.query.tool : [req.query.tool];
        const toolClauses = tools.map(() => "tools LIKE ?");
        query += ` AND (${toolClauses.join(' OR ')})`;
        tools.forEach(t => params.push(`%${t}%`));
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const creators = rows.map(row => ({
            ...row,
            tools: row.tools.split(',')
        }));
        res.json({ creators });
    });
});

// Get Projects
app.get('/api/projects', (req, res) => {
    db.all("SELECT * FROM projects", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ projects: rows });
    });
});

// Register User
app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const stmt = db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`);
    stmt.run(name, email, password, role || 'client', function(err) {
        if (err) {
            return res.status(400).json({ error: "Email is already registered." });
        }
        res.json({
            message: "Account created successfully!",
            user: { id: this.lastID, name, email, role: role || 'client' }
        });
    });
    stmt.finalize();
});

// Login User
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT id, name, email, role FROM users WHERE email = ? AND password = ?`, [email, password], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json({ message: "Logged in successfully!", user: row });
        } else {
            res.status(401).json({ error: "Invalid email or password." });
        }
    });
});

// Submit Brief
app.post('/api/briefs', (req, res) => {
    const { title, brand, description, contentType, visualStyle, aspectRatio, budgetRange, deadline } = req.body;
    if (!title || !brand || !description) {
        return res.status(400).json({ error: "Required fields missing." });
    }

    const stmt = db.prepare(`INSERT INTO briefs (title, brand, description, contentType, visualStyle, aspectRatio, budgetRange, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(title, brand, description, contentType, visualStyle, aspectRatio, budgetRange, deadline, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Creative brief successfully published!", briefId: this.lastID });
    });
    stmt.finalize();
});

// Hire Request
app.post('/api/hire-requests', (req, res) => {
    const { creatorId, senderName, message } = req.body;
    if (!creatorId || !senderName || !message) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const stmt = db.prepare(`INSERT INTO hire_requests (creatorId, senderName, message) VALUES (?, ?, ?)`);
    stmt.run(creatorId, senderName, message, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Hire proposal sent successfully to the creator!" });
    });
    stmt.finalize();
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Kampus.VC Node backend server running at http://localhost:${PORT}`);
});