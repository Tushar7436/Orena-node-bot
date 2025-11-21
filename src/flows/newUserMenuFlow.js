// src/flows/newUserMenuFlow.js

const { sendList, sendText } = require("../services/WhatsappApi");
const courseFlow = require("./courseFlow");
const Flow = require("../services/flowState");

module.exports = {

  // ---------------------------------------------------------
  // NEW USER MENU – RICH LIST MENU WITH DESCRIPTIONS
  // ---------------------------------------------------------
  async sendNewUserMenu(phone) {
    const sections = [
      {
        title: "🎉 Welcome to Orena",
        rows: [
          {
            id: "browse_courses",
            title: "📚 Browse Courses",
            description: "Explore available programs, modules & pricing."
          },
          {
            id: "how_we_work",
            title: "🎓 How We Work",
            description: "Learn our teaching style, mentorship & support."
          },
          {
            id: "pricing",
            title: "💰 Pricing & Offers",
            description: "Check current discounts & course fees."
          },
          {
            id: "login_signup",
            title: "📝 Create Account",
            description: "Start your learning journey with us."
          },
          {
            id: "faqs",
            title: "❓ FAQs & Support",
            description: "Get help with common questions."
          }
        ]
      }
    ];

    return sendList(
      phone,
      "Orena Solutions",
      "Choose an option below:",
      "View Options",
      sections
    );
  },

  // ---------------------------------------------------------
  // NEW USER ACTION HANDLER
  // ---------------------------------------------------------
  async handle(id, phone) {

    if (id === "browse_courses" || id === "browse_courses_again") {
      return courseFlow.list(phone);
    }

    // ─────────────────────────────────────────────
    // HOW WE WORK → SEND INFO + SHOW MENU AGAIN
    // ─────────────────────────────────────────────
    if (id === "how_we_work") {
      await sendText(
        phone,
        "At Orena, we follow a practical-first learning model:\n\n" +
        "• Structured modules\n" +
        "• Weekly mentorship\n" +
        "• Live doubt sessions\n" +
        "• Project-based learning\n" +
        "• Certificates upon completion"
      );

      return this.sendNewUserMenu(phone);
    }

    // ─────────────────────────────────────────────
    // PRICING → SEND INFO + SHOW MENU AGAIN
    // ─────────────────────────────────────────────
    if (id === "pricing") {
      await sendText(
        phone,
        "💰 *Current Offer:* Get *20% OFF* on all courses!\nLimited-time only 🎉"
      );

      return this.sendNewUserMenu(phone);
    }

    // ─────────────────────────────────────────────
    // SIGNUP
    // ─────────────────────────────────────────────
    if (id === "login_signup") {
      Flow.set(phone, "signup_name");
      return sendText(phone, "Great! Let's start your registration.\nWhat's your name?");
    }

    // ─────────────────────────────────────────────
    // FAQ → SEND INFO + SHOW MENU AGAIN
    // ─────────────────────────────────────────────
    if (id === "faqs") {
      await sendText(
        phone,
        "❓ *FAQs are being updated.*\nPlease check back soon! 😊"
      );

      return this.sendNewUserMenu(phone);
    }

    return sendText(phone, "Please pick an option from the menu.");
  }
};
