// src/flows/updateProfileFlow.js

const { sendText, sendButtons } = require("../services/WhatsappApi");
const { updateProfileName, updateProfileEmail } = require("../models/queries");
const flowState = require("../services/flowState");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async function updateProfileFlow(phone, user, messageText) {
  const state = flowState.get(phone).state;
  const msg = messageText.trim().toLowerCase();

  // STEP 1 → Begin profile update
  if (state === "start_update_profile") {
    await sendText(
      phone,
      `What would you like to update?\n\n1. *Name*\n2. *Email*\n\nType *name* or *email*.`
    );

    flowState.set(phone, "update_profile_choice");
    return;
  }

  // STEP 2 → User chooses what to update
  if (state === "update_profile_choice") {
    if (msg === "name") {
      await sendText(phone, "Great! Please tell us your new name.");
      flowState.set(phone, "update_profile_name");
      return;
    }

    if (msg === "email") {
      await sendText(phone, "Sure! Please send your new email address.");
      flowState.set(phone, "update_profile_email");
      return;
    }

    return sendText(phone, "Please type *name* or *email*.");
  }

  // STEP 3A → Update Name
  if (state === "update_profile_name") {
    if (!messageText.trim()) {
      return sendText(phone, "Name cannot be empty. Please send a valid name.");
    }

    await updateProfileName(user.id, messageText.trim());

    await sendButtons(
      phone,
      "Profile Updated",
      [
        { id: "options_loggedin", title: "Main menu" },
        { id: "browse_courses", title: "Explore Courses" },
      ],
      `Your name has been updated to *${messageText.trim()}* 🎉`,
      ""
    );

    flowState.set(phone, "none");
    return;
  }

  // STEP 3B → Update Email
  if (state === "update_profile_email") {
    if (!emailRegex.test(messageText.trim())) {
      return sendText(phone, "Invalid email format.\nExample: user@example.com");
    }

    await updateProfileEmail(user.id, messageText.trim());

    await sendButtons(
      phone,
      "Profile Updated",
      [
        { id: "options_loggedin", title: "Main menu" },
        { id: "browse_courses", title: "Explore Courses" },
      ],
      `Your email has been updated to *${messageText.trim()}* 📧`,
      ""
    );

    flowState.set(phone, "none");
    return;
  }
};
