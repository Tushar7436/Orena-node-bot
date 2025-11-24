// src/flows/loggedInMenuFlow.js

const { sendList, sendText, sendButtons } = require("../services/WhatsappApi");
const { getUserPurchases } = require("../models/queries");

module.exports = {

  // ---------------------------------------------------------
  // LOGGED-IN MENU – accepts dynamic body text
  // ---------------------------------------------------------
  async sendLoggedInMenu(phone, user, bodyText = "Choose an option below:") {

    const sections = [
      {
        title: `👋 Welcome Back, ${user.name}`,
        rows: [
          {
            id: "browse_courses",
            title: "📚 Browse Courses",
            description: "View available courses & explore details."
          },
          {
            id: "your_purchase",
            title: "🎟️ Your Purchases",
            description: "See all courses you’ve enrolled in."
          },
          {
            id: "events",
            title: "📢 Upcoming Events",
            description: "Workshops, live sessions & webinars."
          },
          {
            id: "update_profile",
            title: "👤 Update Profile",
            description: "Edit your name and email."
          },
          {
            id: "exit_flow",
            title: "🚪 Exit",
            description: "End the current session"
          }
        ]
      }
    ];

    return sendList(
      phone,
      "Your Dashboard",
      bodyText,        // <<< DYNAMIC BODY TEXT
      "View Options",
      sections
    );
  },

  // ---------------------------------------------------------
  // LOGGED-IN ACTION HANDLER
  // ---------------------------------------------------------
  async handle(id, phone, user) {

    switch (id) {

      // -----------------------------------------------------
      // PURCHASES
      // -----------------------------------------------------
      case "your_purchase":
        const purchases = await getUserPurchases(user.id);

        if (!purchases.length) {
          await sendText(phone, "You haven’t purchased any course yet.");
          return this.sendLoggedInMenu(phone, user, "What do you want to explore next?");
        }

        const details = purchases.map(p =>
          `📘 *${p.title}*\n` +
          `🆔 Course ID: ${p.course_id}\n` +
          `👤 Name: ${p.name}\n` +
          `📩 Email: ${p.email}\n` +
          `💵 Price: ₹${p.price}\n` +
          `📌 Status: ${p.payment_status}`
        ).join("\n\n");

        return await sendButtons(
          phone,
          "Your Courses",
          [
            { id: "options_loggedin", title: "Main menu" },
            { id: "browse_courses", title: "Explore Courses" },
          ],
          `${details}`,
          ""
        );

      // -----------------------------------------------------
      // EVENTS
      // -----------------------------------------------------
      case "events":
        await sendText(
          phone,
          "📢 There are no upcoming events right now.\nStay tuned!"
        );
        return this.sendLoggedInMenu(phone, user, "Check other options below:");

      // -----------------------------------------------------
      // UPDATE PROFILE
      // -----------------------------------------------------
      case "update_profile":
        await sendText(
          phone,
          "To update your profile, reply with your new Name, Email, Age or Gender."
        );
        return this.sendLoggedInMenu(phone, user, "Continue updating or choose an option:");

      // -----------------------------------------------------
      // FORWARD BROWSE COURSES HANDLING TO actionRouter
      // -----------------------------------------------------
      case "browse_courses":
        return null;
    }

    return null;
  }
};
