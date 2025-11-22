const { sendText, sendButtons } = require("../services/WhatsappApi");
const {
  getCourseById,
  createPendingPurchase,
  userAlreadyPurchased
} = require("../models/queries");

const Razorpay = require("razorpay");

const razor = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = async function startPaymentFlow(phone, courseId, user) {

  // ------------------------------------------------------
  // USER MUST BE LOGGED IN BEFORE PAYMENT
  // ------------------------------------------------------
  if (!user) {
    return sendButtons(
      phone,
      "Signup Required",
      [{ id: "login_signup", title: "Sign Up" }],
      "Please complete signup before purchasing."
    );
  }

  // ------------------------------------------------------
  // GET COURSE
  // ------------------------------------------------------
  const course = await getCourseById(courseId);
  if (!course) return sendText(phone, "Course not found.");

  // ------------------------------------------------------
  // ❗ CHECK IF USER ALREADY PURCHASED THIS COURSE
  // ------------------------------------------------------
  const alreadyPurchased = await userAlreadyPurchased(user.id, courseId);

  if (alreadyPurchased) {
    return sendButtons(
      phone,
      `You already have this course - ${course.title}`,
      [
        { id: "browse_courses", title: "Browse More Courses" },
        { id: "your_purchase", title: "View My Purchases" }
      ],
      "You cannot buy the same course again."
    );
  }

  // ------------------------------------------------------
  // CREATE RAZORPAY ORDER
  // ------------------------------------------------------
  let order;
  try {
    order = await razor.orders.create({
      amount: course.price * 100,
      currency: "INR",
      receipt: `order_${Date.now()}`
    });
  } catch (err) {
    console.error("Razorpay Create Error:", err);
    return sendText(phone, "Payment service is temporarily unavailable.");
  }

  // ------------------------------------------------------
  // CREATE PENDING PURCHASE IN DB
  // ------------------------------------------------------
  await createPendingPurchase(
    user.id,
    courseId,
    course.price,
    order.id
  );

  // ------------------------------------------------------
  // PAYMENT URL
  // ------------------------------------------------------
  const payUrl =
    `https://payment-demo-eta.vercel.app/razorpay?order_id=${order.id}` +
    `&amount=${order.amount}` +
    `&key=${process.env.RAZORPAY_KEY_ID}` +
    `&phone=${phone}` +
    `&course=${encodeURIComponent(course.title)}` +
    `&course_id=${courseId}` +
    `&price=${course.price}` +
    `&email=${user.email}`;

  // ------------------------------------------------------
  // SEND PAYMENT MESSAGE
  // ------------------------------------------------------
  return sendText(
    phone,
    `🧾 *Checkout for ${course.title}*\n\n` +
    `Price: ₹${course.price}\n\n` +
    `Click below to complete payment:\n${payUrl}`
  );
};