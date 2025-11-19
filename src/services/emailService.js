const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPurchaseEmail(to, courseTitle, courseId, price) {
  try {
    const body =
      `🎉 Your Purchase is Confirmed!\n\n` +
      `📘 Course: ${courseTitle}\n` +
      `🆔 Course ID: ${courseId}\n` +
      `💰 Price Paid: ₹${price}\n\n` +
      `You will receive course access shortly!\n`;

    await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to,
      subject: `Course Purchase Confirmation – ${courseTitle}`,
      text: body,
    });

    console.log("📧 Email sent via Resend");
  } catch (error) {
    console.error("Email error:", error);
  }
}

module.exports = { sendPurchaseEmail };
