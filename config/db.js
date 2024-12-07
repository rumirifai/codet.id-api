const mysql = require('mysql2/promise')

// Koneksi ke Google Cloud SQL
const connectDB = async () => {
    const pool = await mysql.createPool({
      host: process.env.DB_HOST, // atau socketPath jika menggunakan Unix socket
      user: process.env.DB_User,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("Connected to Google Cloud SQL");
    return pool;
};

module.exports = connectDB;