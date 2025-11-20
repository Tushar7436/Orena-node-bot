// src/flows/loggedInMenuFlow.js

const { sendList, sendText } = require("../services/WhatsappApi");
const { getUserPurchases } = require("../models/queries");

module.exports = {
  
  // ───────────────────────────────
  // Logged-in Menu (NOW A LIST)
  // ───────────────────────────────
  async sendLoggedInMenu(phone, user) {
    const sections = [
      {
        title: `Welcome Student`,
        rows: [
          { id: "browse_courses", title: "Browse Courses" },
          { id: "your_purchase", title: "Your Purchases" },
          { id: "events", title: "Upcoming events" },
          { id: "update_profile", title: "Update Profile" }
        ]
      }
    ];

    return sendList(
      phone,
      "Your Menu",
      "options below",
      "View Options",
      sections
    );
  },

  // ───────────────────────────────
  // Logged-in Actions
  // ───────────────────────────────
  async handle(id, phone, user) {
    switch (id) {

      case "your_purchase":
        const purchases = await getUserPurchases(user.id);

        if (!purchases.length) {
          return sendText(phone, "You have not purchased any course yet.");
        }

        const details = purchases.map(p =>
          `📘 *${p.title}*\n` +
          `Course ID: ${p.course_id}\n` +
          `Student: ${p.name}\n` +
          `Email: ${p.email}\n` +
          `Price Paid: ₹${p.price}\n` +
          `Status: ${p.payment_status}`
        ).join("\n\n");

        return sendText(phone, details);

      case "events":
        return sendText(
          phone,
          "there are no available events right now. please try again later"
        );

      case "update_profile":
        return sendText(phone, "Send your updated name or email to update profile.");

      // NEW OPTION — Browse Courses → handled by courseFlow
      case "browse_courses":
        return null;  // actionRouter will forward this to courseFlow
    }

    return null; // not handled here
  }
};
