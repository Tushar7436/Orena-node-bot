const express = require("express");
const router = express.Router();
const { sendText } = require("../services/WhatsappApi");
const { enrollUserInCourse } = require("../models/queries");

router.post("/success", async (req, res) => {
  try {
    const {
      phone,
      course_id,
      course_name,
      order_id,
      payment_id,
      amount
    } = req.body;

    console.log("PAYMENT SUCCESS DATA:", req.body);

    // 1. Store the purchase in DB
    await enrollUserInCourse({
      phone,
      course_id,
      order_id,
      payment_id,
      amount
    });

    // 2. Send WhatsApp confirmation
    await sendText(
      phone,
      `🎉 *Payment Successful!*\n\n` +
      `You are now enrolled in:\n` +
      `📘 *${course_name}*\n\n` +
      `🧾 *Order ID:* ${order_id}\n` +
      `💳 *Payment ID:* ${payment_id}\n` +
      `💰 *Amount Paid:* ₹${amount / 100}\n\n` +
      `You will receive course access shortly!`
    );

    return res.status(200).json({ status: "ok" });

  } catch (err) {
    console.error("Payment success error:", err);
    return res.status(500).json({ error: "Failed to process payment" });
  }
});

module.exports = router;
