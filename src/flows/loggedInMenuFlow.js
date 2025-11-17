// src/flows/loggedInMenuFlow.js

const { sendList, sendText } = require("../services/whatsappApi");
const { getUserPurchases } = require("../models/queries");

module.exports = {
  
  // ───────────────────────────────
  // Logged-in Menu (NOW A LIST)
  // ───────────────────────────────
  async sendLoggedInMenu(phone, user) {
    const sections = [
      {
        title: `Welcome ${user.name}`,
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
      "Choose an option below",
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
        const purchases = await getUserPurchases(user?.id);
        if (!purchases || purchases.length === 0) {
          return sendText(phone, "You have not purchased any course yet.");
        }

        return sendText(
          phone,
          `Your Purchases:\n${purchases.map(p => "- " + p.name).join("\n")}`
        );

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
