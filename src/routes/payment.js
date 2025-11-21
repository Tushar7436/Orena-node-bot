// src/routes/payment.js

const express = require("express");
const router = express.Router();
const { sendButtons } = require("../services/WhatsappApi");

const {
  updatePurchaseOnSuccess,
  getUserPurchasesByOrderId
} = require("../models/queries");

router.post("/", async (req, res) => {
  try {
    const { phone, order_id, payment_id, amount } = req.body;

    console.log("📩 Payment Webhook Received:", req.body);

    // Update DB
    await updatePurchaseOnSuccess(order_id, payment_id);
    console.log("✅ Database updated");

    // Fetch updated purchase details
    const purchases = await getUserPurchasesByOrderId(order_id);
    const purchase = purchases?.[0];
    console.log("📦 Purchase details:", purchase);

    // WhatsApp success message + BUTTON
    const text =
      `🎉 *Payment Successful!*\n\n` +
      `🧾 *Order ID:* ${order_id}\n` +
      `💳 *Payment ID:* ${payment_id}\n` +
      `💰 *Amount Paid:* ₹${amount / 100}\n\n` +
      `📥 Please check your mailbox.\n` +
      `📚 Your course is now unlocked!`;

    const buttons = [
      { id: "your_purchase", title: "📘 View My Courses" },
      { id: "exit_flow", title: "🚪 Exit" }  
    ];

    console.log("📱 Attempting to send WhatsApp message to:", phone);
    
    // Send WhatsApp message
    const whatsappResult = await sendButtons(phone, "Payment Confirmed!", buttons, text);
    console.log("✅ WhatsApp message sent:", whatsappResult);

    return res.status(200).json({ 
      status: "ok",
      whatsapp_sent: true 
    });

  } catch (err) {
    console.error("❌ Payment success error:", err);
    return res.status(500).json({ 
      error: "Failed to process payment",
      details: err.message 
    });
  }
});

module.exports = router;