const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/razorpay-webhook", async (req, res) => {
  try {
    const event = req.body;

    if (event.event === "payment.captured") {
      const order = event.payload.payment.entity;

      const courseId = order.notes.courseId;
      const phone = order.notes.phone;

      await pool.query(
        `INSERT INTO purchases (phone, course_id, payment_id, status)
         VALUES ($1, $2, $3, $4)`,
        [phone, courseId, order.id, "PAID"]
      );

      console.log("Payment captured:", order.id);

      res.status(200).send("OK");
    } else {
      res.status(200).send("Ignored");
    }
  } catch (err) {
    console.error("Webhook Error:", err);
    res.status(500).send("Webhook processing failed");
  }
});

module.exports = router;
