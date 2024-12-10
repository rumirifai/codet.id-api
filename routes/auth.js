const User = require('../models/User');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/register', async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const user = await User.create({ name, email, password });
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isValidPassword = await User.validatePassword(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
