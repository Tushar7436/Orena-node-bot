const express = require("express");
const router = express.Router();
const { sendText } = require("../services/WhatsappApi");

router.post("/", async (req, res) => {
  try {
    const { phone, order_id, payment_id, amount } = req.body;

    const text =
      `🎉 *Payment Successful!*\n\n` +
      `🧾 *Order ID:* ${order_id}\n` +
      `💳 *Payment ID:* ${payment_id}\n` +
      `💰 *Amount Paid:* ₹${amount / 100}\n\n` +
      `You will receive course details and access shortly!`;

    console.log("PAYMENT SUCCESS DATA:", req.body);

    await sendText(phone, text);

    return res.status(200).json({ status: "ok" });

  } catch (err) {
    console.error("Payment success error:", err);
    return res.status(500).json({ error: "Failed to process payment" });
  }
});

module.exports = router;
