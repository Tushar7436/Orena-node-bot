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

// PROFILE UPDATE: Update Name (Uses student.id)
async function updateProfileName(studentId, name) {
  await pool.query(
    `UPDATE students 
     SET name = $1
     WHERE id = $2`,
    [name, studentId]
  );
}

// PROFILE UPDATE: Update Email (Uses student.id)
async function updateProfileEmail(studentId, email) {
  await pool.query(
    `UPDATE students 
     SET email = $1
     WHERE id = $2`,
    [email, studentId]
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

// 1. Create pending purchase when generating payment page
async function createPendingPurchase(student_id, course_id, price, order_id) {
  const res = await pool.query(
    `INSERT INTO purchases (student_id, course_id, price, payment_status, order_id)
     VALUES ($1, $2, $3, 'pending', $4)
     RETURNING *`,
    [student_id, course_id, price, order_id]
  );
  return res.rows[0];
}

// 2. Update purchase after successful payment from frontend
async function updatePurchaseOnSuccess(order_id, payment_id) {
  await pool.query(
    `UPDATE purchases
     SET payment_id = $1,
         payment_status = 'completed'
     WHERE order_id = $2`,
    [payment_id, order_id]
  );
}

// 3. Get purchases for "Your Purchases" button
async function getUserPurchases(student_id) {
  const res = await pool.query(`
    SELECT 
      purchases.id AS purchase_id,
      courses.id AS course_id,
      courses.title,
      purchases.price,
      purchases.payment_status,
      students.name,
      students.email
    FROM purchases
    JOIN courses ON purchases.course_id = courses.id
    JOIN students ON purchases.student_id = students.id
    WHERE purchases.student_id = $1 AND payment_status='completed'
  `, [student_id]);

  return res.rows;
}

async function getUserPurchasesByOrderId(order_id) {
  const res = await pool.query(`
    SELECT 
      purchases.id AS purchase_id,
      courses.id AS course_id,
      courses.title,
      purchases.price,
      purchases.payment_status,
      students.name,
      students.email
    FROM purchases
    JOIN courses ON purchases.course_id = courses.id
    JOIN students ON purchases.student_id = students.id
    WHERE purchases.order_id = $1
  `, [order_id]);

  return res.rows;
}


module.exports = {
  findStudentByPhone,
  createStudent,
  updateStudentName,
  updateStudentEmail,
  setRegistrationState,
  getAllCourses,
  getCourseById,
  createPendingPurchase,
  updatePurchaseOnSuccess,
  getUserPurchases,
  getUserPurchasesByOrderId,
  updateProfileName,
  updateProfileEmail
};
