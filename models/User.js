const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

class user {
    static async create({name, email, password}) {
        const db = await connectDB();
        const hashedPassword = await bcrypt.hash(password, 18);
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        const [result] = await db.execute(query, [name, email, hashedPassword]);
        return { id: result.insertId, name, email };
    }

    static async findByEmail(email) {
        const db = await connectDB();
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.execute(query, [email]);
        return rows[0];
    }

    static async validatePassword(inputPassword, storedpassword) {
        return await bcrypt.compare(inputPassword, storedpassword);
    }
};

module.exports = user;