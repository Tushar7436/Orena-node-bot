// src/services/razorService.js

const Razorpay = require("razorpay");

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function createOrder(amount, courseId, phone) {
  return await razor.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `rcpt_${courseId}_${Date.now()}`,
    notes: { phone, courseId }
  });
}

module.exports = { razor, createOrder };
