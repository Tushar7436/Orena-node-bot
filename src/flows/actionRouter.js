// src/flows/actionRouter.js

const { sendText } = require("../services/WhatsappApi");
const loggedInMenuFlow = require("./loggedInMenuFlow");
const newUserMenuFlow = require("./newUserMenuFlow");
const courseFlow = require("./courseFlow");
const paymentFlow = require("./paymentFlow");
const { findStudentByPhone } = require("../models/queries");
const Flow = require("../services/flowState");
const updateProfileFlow = require("./updateProfileFlow");

module.exports = async function actionRouter(id, phone, session) {
  const user = await findStudentByPhone(phone);

  console.log("ACTION RECEIVED →", id);

  // NEW USER ACTIONS
  if (id === "browse_courses") return courseFlow.list(phone);
  if (id === "how_we_work") return sendText(phone, "We offer structured modules, live doubt sessions, projects, and certificates.");
  if (id === "pricing") return sendText(phone, "Current Offer: 20% OFF on all courses!");

  if (id === "update_profile") {
    Flow.set(phone, "start_update_profile");
    return updateProfileFlow(phone, user, "");
  }

  if (id === "login_signup") {
  Flow.set(phone, "signup_name");
  return sendText(phone, "Let's get started! What's your name?");
  }
  if (id === "faqs")
    return sendText(phone, "currently we are working on these feature! Stay tunned");

  // COURSE DETAILS
  if (id.startsWith("course_"))
    return courseFlow.details(phone, id.split("_")[1]);

  // PAYMENT
  if (id.startsWith("pay_")) {
    const courseId = id.split("_")[1];
    return paymentFlow(phone, courseId, user);  // ✅ FIXED
  }


  // LOGGED-IN USER ACTIONS
  if (user) {
    const output = await loggedInMenuFlow.handle(id, phone, user);
    if (output) return output;
  }

  return sendText(phone, "Unknown option, please try again.");
};
