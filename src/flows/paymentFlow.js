const { sendText } = require("../services/WhatsappApi");
const { getCourseById, createPendingPurchase } = require("../models/queries");
const Razorpay = require("razorpay");

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = async function startPaymentFlow(phone, courseId, user) {

  // Safety: user must exist
  if (!user) {
    return sendText(phone, "Please complete signup before purchasing.");
  }

  const course = await getCourseById(courseId);
  if (!course) return sendText(phone, "Course not found.");

  const amount = course.price * 100;

  let order;
  try {
    order = await razor.orders.create({
      amount,
      currency: "INR",
      receipt: `order_${Date.now()}`
    });
  } catch (err) {
    console.error("Razorpay Create Error:", err);
    return sendText(phone, "Payment service is temporarily unavailable.");
  }

  // Create pending purchase in DB
  await createPendingPurchase(
    user.id,        // ← students.id
    courseId,        // ← courses.id
    course.price,
    order.id
  );

  const payUrl =
    `https://payment-demo-eta.vercel.app/razorpay?order_id=${order.id}` +
    `&amount=${order.amount}` +
    `&key=${process.env.RAZORPAY_KEY_ID}` +
    `&phone=${phone}` +
    `&course=${encodeURIComponent(course.title)}` +
    `&course_id=${courseId}` +
    `&price=${course.price}` +
    `&email=${user.email}`;

  const text =
    `🧾 *Checkout for ${course.title}*\n\n` +
    `Price: ₹${course.price}\n\n` +
    `Click below to complete payment:\n${payUrl}`;

  return sendText(phone, text);
};
