const express = require('express');
const multer = require('multer');
const { uploadFile } = require('../utils/storage');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/upload', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    const destination = `uploads/${req.file.originalname}`;
    try {
        await uploadFile(filePath, destination);
        res.json({ message: 'File uploaded successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
