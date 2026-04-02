const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const id = crypto.randomUUID();

        const [result] = await db.query(
            'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
            [id, name, email, password]
        );

        res.json({ id, name, email, createdAt: new Date().toISOString() });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);

        if (rows.length > 0) {
            const user = rows[0];
            res.json({ id: user.id, name: user.name, email: user.email, createdAt: user.created_at });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
