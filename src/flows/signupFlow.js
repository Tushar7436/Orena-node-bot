const { sendText } = require("../services/WhatsappApi");
const { createStudent, findStudentByPhone } = require("../models/queries");
const Flow = require("../services/flowState");
const loggedInMenuFlow = require("./loggedInMenuFlow");
const axios = require("axios");

module.exports = async function signupFlow(phone, text) {
  const state = Flow.get(phone);

  /* -------------------------------------------------------
     🚀 EARLY CHECK — User Already Exists
  --------------------------------------------------------- */
  const existing = await findStudentByPhone(phone);
  if (existing) {
    await sendText(phone, `👋 You are already logged in as *${existing.name}*.`);
    
    // show menu immediately
    await loggedInMenuFlow.sendLoggedInMenu(phone, existing);

    // stop signup flow completely
    return { handled: true };
  }

  /* -------------------------------------------------------
     STEP 1 — Ask Name
  --------------------------------------------------------- */
  if (state.state === "signup_name") {
    const name = text.trim();

    if (name.length < 2) {
      await sendText(phone, "Please enter a valid name.");
      return { handled: true };
    }

    Flow.setTemp(phone, "tempName", name);
    Flow.set(phone, "signup_email");

    await sendText(phone, `Nice to meet you, ${name} 😊\nWhat's your email?`);
    return { handled: true };
  }

  /* -------------------------------------------------------
     STEP 2 — Ask Email
  --------------------------------------------------------- */
  if (state.state === "signup_email") {
    const email = text.trim();

    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      await sendText(phone, "Please enter a valid email.");
      return { handled: true };
    }

    // Create Student in DB
    const student = await createStudent({
      phone,
      name: state.tempName,
      email
    });

    // Reset flow state
    Flow.set(phone, "none");

    await sendText(
      phone,
      `🎉 *Your account has been created!*\n\nName: ${state.tempName}\nEmail: ${email}`
    );

    // Notify frontend (welcome email)
    try {
      await axios.get(process.env.FRONTEND_WELCOME_URL, {
        name: student.name,
        email: student.email,
        phone
      });
    } catch (err) {
      console.error("Error sending welcome message:", err.message);
    }

    // Show Logged-in Menu
    await loggedInMenuFlow.sendLoggedInMenu(phone, student);

    return { handled: true };
  }

  return { handled: false };
};
