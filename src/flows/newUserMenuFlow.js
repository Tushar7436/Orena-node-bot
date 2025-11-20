// src/flows/newUserMenuFlow.js

const { sendList } = require("../services/WhatsappApi");

module.exports = {
  async sendNewUserMenu(phone) {
    const sections = [
      {
        title: "Main Menu",
        rows: [
          { id: "browse_courses", title: "Browse Courses" },
          { id: "how_we_work", title: "How We Work" },
          { id: "pricing", title: "Pricing & Special Offers" },
          { id: "login_signup", title: "Sign Up" },
          { id: "faqs", title: "Help & FAQs" }
        ]
      }
    ];

    return sendList(
      phone,
      "Menu",
      "options",
      "View Options",
      sections
    );
  }
};
