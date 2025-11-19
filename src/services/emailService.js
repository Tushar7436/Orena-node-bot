const email = require("emailjs");

const server = email.server.connect({
  user: process.env.EMAIL_USER,        // your email
  password: process.env.EMAIL_PASS,    // your email password / app password
  host: "smtp.gmail.com",              // Gmail SMTP
  ssl: true
});

function sendPurchaseEmail(to, courseTitle, courseId, price) {
  const body =
    `🎉 Your Purchase is Confirmed!\n\n` +
    `📘 Course: ${courseTitle}\n` +
    `🆔 Course ID: ${courseId}\n` +
    `💰 Price Paid: ₹${price}\n\n` +
    `You will receive course access shortly.\n\n` +
    `Thank you for choosing Orenna!`;

  server.send({
    text: body,
    from: "Orenna Courses <" + process.env.EMAIL_USER + ">",
    to,
    subject: `Course Purchase Confirmation – ${courseTitle}`
  }, (err, msg) => {
    if (err) {
      console.error("❌ Email send error:", err);
    } else {
      console.log("📧 Email sent:", msg);
    }
  });
}

module.exports = { sendPurchaseEmail };
