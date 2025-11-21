const { sendText, sendButtons } = require("../services/WhatsappApi");
const { createStudent, findStudentByPhone } = require("../models/queries");
const Flow = require("../services/flowState");
const loggedInMenuFlow = require("./loggedInMenuFlow");

module.exports = async function signupFlow(phone, text) {
  const flowData = Flow.get(phone);
  const currentState = flowData.state;

  // -------------------------------------------------------
  // Already exists
  // -------------------------------------------------------
  const existing = await findStudentByPhone(phone);
  if (existing) {
    await sendText(phone, `👋 You are already logged in as *${existing.name}*.`);
    await loggedInMenuFlow.sendLoggedInMenu(phone, existing);
    Flow.reset(phone);
    return { handled: true };
  }

  // -------------------------------------------------------
  // STEP 1 — NAME
  // -------------------------------------------------------
  if (currentState === "signup_name") {
    const name = text.trim();

    if (name.length < 2) {
      await sendText(phone, "Please enter a valid name.");
      return { handled: true };
    }

    Flow.setTemp(phone, "tempName", name);
    Flow.set(phone, "signup_email");

    await sendText(phone, `Great! Now enter your email address:`);
    return { handled: true };
  }

  // -------------------------------------------------------
  // STEP 2 — EMAIL
  // -------------------------------------------------------
  if (currentState === "signup_email") {
    const email = text.trim();

    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      await sendText(phone, "Please enter a valid email.");
      return { handled: true };
    }

    Flow.setTemp(phone, "tempEmail", email);
    Flow.set(phone, "signup_age");

    await sendText(phone, `Awesome! Please tell me your age:`);
    return { handled: true };
  }

  // -------------------------------------------------------
  // STEP 3 — AGE
  // -------------------------------------------------------
  if (currentState === "signup_age") {
    const age = parseInt(text.trim());

    if (isNaN(age) || age < 8 || age > 90) {
      await sendText(phone, "Please enter a valid age.");
      return { handled: true };
    }

    Flow.setTemp(phone, "tempAge", age);
    Flow.set(phone, "signup_gender");

    await sendButtons(
      phone,
      "Select Gender",
      [
        { id: "gender_male", title: "Male" },
        { id: "gender_female", title: "Female" },
        { id: "gender_other", title: "Other" }
      ],
      "Choose your gender:"
    );
    
    return { handled: true };
  }

  // -------------------------------------------------------
  // STEP 4 — GENDER (BUTTON)
  // -------------------------------------------------------
  if (currentState === "signup_gender") {
    let gender = null;

    if (text === "gender_male") gender = "Male";
    else if (text === "gender_female") gender = "Female";
    else if (text === "gender_other") gender = "Other";
    else {
      await sendText(phone, "Please choose a gender from the buttons.");
      return { handled: true };
    }

    // Validate all data exists
    if (!flowData.tempName || !flowData.tempEmail || !flowData.tempAge) {
      await sendText(phone, "❌ Something went wrong. Please start again by typing 'signup'.");
      Flow.reset(phone);
      return { handled: true };
    }

    const studentData = {
      phone,
      name: flowData.tempName,
      email: flowData.tempEmail,
      age: flowData.tempAge,
      gender
    };

    const student = await createStudent(studentData);

    Flow.reset(phone);

    await sendText(
      phone,
      `🎉 *Signup Complete!*\n\n` +
      `👤 Name: ${student.name}\n` +
      `📩 Email: ${student.email}\n` +
      `🎂 Age: ${student.age}\n` +
      `🚻 Gender: ${student.gender}`
    );

    await loggedInMenuFlow.sendLoggedInMenu(phone, student);

    return { handled: true };
  }

  return { handled: false };
};