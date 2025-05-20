const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Sequelize User model
const router = express.Router();

// User signup
router.post('/signup', async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password || !phone || !address) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, phone, address });
        res.status(201).json({ message: 'User created successfully.', user });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user.', error });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for hardcoded admin credentials
        if (email === 'admin@gmail.com' && password === 'Aa!123456') {
            // localStorage.setItem('isAdmin', 'true')
            const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.json({ message: 'Admin login successful.', token, name: 'Admin', role: 'admin' });
        }


        // Check for regular user credentials
        const user = await User.findOne({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        // localStorage.setItem('isAdmin', 'false')
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful.', token, name: user.name, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in.', error });
    }
});

module.exports = router;