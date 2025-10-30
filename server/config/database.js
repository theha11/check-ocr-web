require('dotenv').config();
const pgp = require('pg-promise')();

const connection = {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    // Bổ sung SSL nếu cần
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const db = pgp(connection);

// Kiểm tra kết nối
db.connect()
    .then(obj => {
        console.log('Database connected successfully');
        obj.done(); // giải phóng connection khi đã xong
    })
    .catch(error => {
        console.error('Database connection error:', error);
    });

module.exports = db;