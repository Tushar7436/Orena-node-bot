// src/flows/greetingFlow.js

const { sendText } = require("../services/WhatsappApi");
const loggedInMenuFlow = require("./loggedInMenuFlow");
const newUserMenuFlow = require("./newUserMenuFlow");
const { findStudentByPhone } = require("../models/queries");

module.exports = async function greetingFlow(phone, session) {
  const user = await findStudentByPhone(phone);

  if (user) {
    return loggedInMenuFlow.sendLoggedInMenu(phone, user);
  } else {
    return newUserMenuFlow.sendNewUserMenu(phone);
  }
};
