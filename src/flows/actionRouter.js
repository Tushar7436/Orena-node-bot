// src/flows/actionRouter.js

const { sendText } = require("../services/WhatsappApi");
const loggedInMenuFlow = require("./loggedInMenuFlow");
const newUserMenuFlow = require("./newUserMenuFlow");
const courseFlow = require("./courseFlow");
const paymentFlow = require("./paymentFlow");
const updateProfileFlow = require("./updateProfileFlow");
const signupFlow = require("./signupFlow");
const Flow = require("../services/flowState");
const { findStudentByPhone } = require("../models/queries");

module.exports = async function actionRouter(id, phone, session) {

  const state = Flow.get(phone)?.state;


  // OVERRIDE: SIGNUP FLOW ALWAYS RUNS FIRST
  if (state && state.startsWith("signup_")) {
    return signupFlow(phone, id);     
  }

  const user = await findStudentByPhone(phone);

  console.log("ACTION RECEIVED:", id);

 
  // UNIVERSAL OPTION: Browse Courses
  if (id === "browse_courses" || id === "browse_courses_again") {
    return courseFlow.list(phone);
  }

  // UNIVERSAL OPTIONS BUTTONS FROM COURSEFLOW
  if (id === "options_loggedin") {
    return loggedInMenuFlow.sendLoggedInMenu(phone, user);
  }

  if (id === "options_newuser") {
    return newUserMenuFlow.sendNewUserMenu(phone);
  }

  // COURSE DETAILS
  if (id.startsWith("course_")) {
    const courseId = id.split("_")[1];
    return courseFlow.details(phone, courseId);
  }

  // PAYMENT
  if (id.startsWith("pay_")) {
    const courseId = id.split("_")[1];
    return paymentFlow(phone, courseId, user);
  }

  // LOGGED-IN USER ACTIONS
  if (user) {

    if (id === "update_profile") {
      Flow.set(phone, "start_update_profile");
      return updateProfileFlow(phone, user, "");
    }

    const output = await loggedInMenuFlow.handle(id, phone, user);
    if (output) return output;
  }
  // EXIT USER ACTIONS
  if (id === "exit_flow") {
    Flow.set(phone, "none"); // reset flow state

    return sendText(
      phone,
      "🙏 Thank you for using Orena! Your session has ended.\n\n" +
      "You can type *Hi* anytime to restart."
    );
  }
  // NEW USER FALLBACK
  if (!user) {
    return newUserMenuFlow.handle(id, phone);
  }

  return sendText(phone, "Unknown option, please try again.");
};
