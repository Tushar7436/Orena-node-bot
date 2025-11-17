const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.createSession = async (phone) => {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // +1 hour

  const result = await pool.query(
    `INSERT INTO sessions(phone, session_token, expires_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [phone, token, expiresAt]
  );
  return result.rows[0];
};

exports.getActiveSession = async (phone) => {
  const result = await pool.query(
    `SELECT * FROM sessions
     WHERE phone = $1 AND is_active = TRUE AND expires_at > NOW()
     ORDER BY id DESC LIMIT 1`,
    [phone]
  );
  return result.rows[0] || null;
};

exports.expireOldSessions = async (phone) => {
  await pool.query(
    `UPDATE sessions
     SET is_active = FALSE
     WHERE phone = $1`,
    [phone]
  );
};
