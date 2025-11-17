// src/models/queries.js
const pool = require("../config/db");

/* --------------------------------------------------------
   STUDENT QUERIES
---------------------------------------------------------*/

// Get student by phone
async function findStudentByPhone(phone) {
  const res = await pool.query(
    `SELECT * FROM students WHERE phone = $1 LIMIT 1`,
    [phone]
  );
  return res.rows[0];
}

// Create new student (initial state: WAITING_FOR_NAME)
async function createStudent ({ phone, name, email })  {
  const result = await pool.query(
    `INSERT INTO students (phone, name, email)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [phone, name, email]
  );
  return result.rows[0];
};


// Update ONLY Name
async function updateStudentName(phone, name) {
  await pool.query(
    `UPDATE students 
     SET name = $1, registration_state = 'WAITING_FOR_EMAIL'
     WHERE phone = $2`,
    [name, phone]
  );
}

// Update ONLY Email
async function updateStudentEmail(phone, email) {
  await pool.query(
    `UPDATE students 
     SET email = $1, registration_state = NULL
     WHERE phone = $2`,
    [email, phone]
  );
}

// Update registration state
async function setRegistrationState(phone, state) {
  await pool.query(
    `UPDATE students SET registration_state = $1 WHERE phone = $2`,
    [state, phone]
  );
}

/* --------------------------------------------------------
   COURSE QUERIES
---------------------------------------------------------*/

async function getAllCourses() {
  const { rows } = await pool.query(
    `SELECT id, title, description, price
     FROM courses ORDER BY id ASC`
  );
  return rows;
}

async function getCourseById(id) {
  const res = await pool.query(
    `SELECT * FROM courses WHERE id = $1 LIMIT 1`,
    [id]
  );
  return res.rows[0];
}

/* --------------------------------------------------------
   PURCHASE QUERIES
---------------------------------------------------------*/

async function createPurchase({ student_id, course_id, payment_id, amount }) {
  const res = await pool.query(
    `INSERT INTO purchases (student_id, course_id, payment_id, amount)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [student_id, course_id, payment_id, amount]
  );
  return res.rows[0];
}

module.exports = {
  findStudentByPhone,
  createStudent,
  updateStudentName,
  updateStudentEmail,
  setRegistrationState,
  getAllCourses,
  getCourseById,
  createPurchase
};
