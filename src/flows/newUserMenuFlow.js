// src/flows/newUserMenuFlow.js

const { sendList, sendText,sendButtons } = require("../services/WhatsappApi");
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
      return await sendButtons(
          phone,
          "How we work",
          [
            { id: "options_newuser", title: "Main menu" },
            { id: "browse_courses", title: "Explore Courses" },
          ],
        "At Orena, we follow a practical-first learning model:\n" +
        "• Structured modules\n" +
        "• Weekly mentorship\n" +
        "• Live doubt sessions\n" +
        "• Project-based learning\n" +
        "• Certificates upon completion",
        "select below"
        );
    }

    // ─────────────────────────────────────────────
    // PRICING → SEND INFO + SHOW MENU AGAIN
    // ─────────────────────────────────────────────
    if (id === "pricing") {
      return await sendButtons(
          phone,
          "pricing and Offers",
          [
            { id: "options_newuser", title: "Main menu" },
            { id: "browse_courses", title: "Explore Courses" },
          ],
          "💰 *Current Offer:* Get *20% OFF* on all courses!\nLimited-time only 🎉",
          "select below"
        );
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
      return await sendButtons(
          phone,
          "Faqs",
          [
            { id: "options_newuser", title: "Main menu" },
            { id: "browse_courses", title: "Explore Courses" },
          ],
          "❓*FAQs are being updated.*\nPlease check back soon! 😊",
          "select below"
        );
    }

    return sendText(phone, "Please pick an option from the menu.");
  }
};
