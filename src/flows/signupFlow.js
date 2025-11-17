const { sendText } = require("../services/whatsappApi");
const { createStudent } = require("../models/queries");
const Flow = require("../services/flowstate");

module.exports = async function signupFlow(phone, text) {
  const state = Flow.get(phone);

  // STEP 1: Ask Name
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

  // STEP 2: Ask Email
  if (state.state === "signup_email") {
    const email = text.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      await sendText(phone, "Please enter a valid email.");
      return { handled: true };
    }

    await createStudent({
      phone,
      name: state.tempName,
      email
    });

    Flow.set(phone, "none");

    await sendText(
      phone,
      `🎉 *Your account has been created!*\n\nName: ${state.tempName}\nEmail: ${email}`
    );

    return { handled: true };
  }

  return { handled: false };
};
