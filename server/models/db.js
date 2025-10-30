const db = require('../config/database');

// Tạo user mới
async function createUser(username, passwordHash) {
    return db.one(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
        [username, passwordHash]
    );
}

// Tìm user theo username
async function findUserByUsername(username) {
    return db.oneOrNone('SELECT * FROM users WHERE username = $1', username);
}

// Tìm user theo id
async function findUserById(id) {
    return db.oneOrNone('SELECT * FROM users WHERE id = $1', id);
}

// Thêm check mới
async function createCheck(checkData) {
    return db.one(
        `INSERT INTO checks (
            user_id, check_number, amount, payee, date,
            micr_data, image_path, ocr_content
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id`,
        [
            checkData.userId,
            checkData.checkNumber,
            checkData.amount,
            checkData.payee,
            checkData.date,
            checkData.micrData,
            checkData.imagePath,
            checkData.ocrContent
        ]
    );
}

// Lấy danh sách check của user
async function getUserChecks(userId) {
    return db.any('SELECT * FROM checks WHERE user_id = $1 ORDER BY created_at DESC', userId);
}

// Lấy chi tiết một check
async function getCheckById(checkId, userId) {
    return db.oneOrNone(
        'SELECT * FROM checks WHERE id = $1 AND user_id = $2',
        [checkId, userId]
    );
}

module.exports = {
    createUser,
    findUserByUsername,
    findUserById,
    createCheck,
    getUserChecks,
    getCheckById
};