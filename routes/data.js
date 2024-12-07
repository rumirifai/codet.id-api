const express = require('express');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/trees', authMiddleware, async (req, res) => {
    res.json([
        { id: 1, name: 'Coconut Tree A', disease: 'Healthy' },
        { id: 2, name: 'Coconut Tree B', disease: 'Yellowing' },
    ]);
});

module.exports = router;
