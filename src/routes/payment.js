const express = require("express");
const router = express.Router();
const { sendText } = require("../services/WhatsappApi");
const { updatePurchaseOnSuccess, getUserPurchasesByOrderId } = require("../models/queries");
const { sendPurchaseEmail } = require("../services/emailService");

router.post("/", async (req, res) => {
  try {
    const { phone, order_id, payment_id, amount } = req.body;

    // Update database
    await updatePurchaseOnSuccess(order_id, payment_id);

    // Fetch the updated purchase + student + course details
    const purchases = await getUserPurchasesByOrderId(order_id);
    const purchase = purchases[0];

    // Send Email to student
    sendPurchaseEmail(
      purchase.email,
      purchase.title,
      purchase.course_id,
      purchase.price
    );

    const text =
      `🎉 *Payment Successful!*\n\n` +
      `🧾 *Order ID:* ${order_id}\n` +
      `💳 *Payment ID:* ${payment_id}\n` +
      `💰 *Amount Paid:* ₹${amount / 100}\n\n` +
      `You will receive course details and access shortly!`;

    await sendText(phone, text);

    return res.status(200).json({ status: "ok" });

  } catch (err) {
    console.error("Payment success error:", err);
    return res.status(500).json({ error: "Failed to process payment" });
  }
});

module.exports = router;
