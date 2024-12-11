const connectDB = require('../config/db');

class trees {
    static async disease({disease_id}) {
        const db = await connectDB();
        const query = 'SELECT * FROM disease WHERE disease_id = ?';
        const [rows] = await db.execute(query, [disease_id]);
        return rows[0];
    }

    static async saved({status, details, indication, treatment, image_url, user_id, disease_id}) {
        const db = await connectDB();
        const query = 'INSERT INTO scan_result (status, details, indication, treatment, image_url, user_id, disease_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [status, details, indication, treatment, image_url, user_id, disease_id]);
        return { id: result.insertId, status, details, indication, treatment, image_url, user_id, disease_id };
    }

    static async history({user_id}) {
        const db = await connectDB();
        const query = "SELECT * FROM scan_result WHERE user_id = ? ORDER BY created_at DESC";
        const [rows] = await db.execute(query, [user_id]);
        return rows;
    }

    static async historyById({scan_id, user_id}) {
        const db = await connectDB();
        const query = "SELECT * FROM scan_result WHERE scan_id = ? AND user_id = ?";
        const [rows] = await db.execute(query, [scan_id, user_id]);
        return rows[0];
    } 
};

module.exports = trees;