// src/controllers/whatsappController.js

const { getOrCreateSession } = require("../services/sessionService");
const greetingFlow = require("../flows/greetingFlow");
const actionRouter = require("../flows/actionRouter");
const signupFlow = require("../flows/signupFlow");
const aiFallback = require("../ai/aiFallback");
const updateProfileFlow = require("../flows/updateProfileFlow");
const Flow = require("../services/flowState");
const { findStudentByPhone } = require("../models/queries");

exports.handleWebhook = async (req, res) => {
  res.sendStatus(200);

  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (!message) return;

  const phone = message.from;
  const type = message.type;
  const textBody = message.text?.body || "";

  const session = await getOrCreateSession(phone);
  const user = await findStudentByPhone(phone);
  const state = Flow.get(phone)?.state;

  // ─────────────────────────────────────
  // SIGNUP FLOW
  // ─────────────────────────────────────
  if (state && state.startsWith("signup_")) {
    // Handle gender button selection
    if (state === "signup_gender" && type === "interactive") {
      const id = message.interactive?.button_reply?.id;
      await signupFlow(phone, id);
      return;
    }

    // Handle text inputs (name, email, age)
    const result = await signupFlow(phone, textBody);
    if (result?.handled) return;
  }

  // ─────────────────────────────────────
  // INTERACTIVE BUTTONS / LISTS
  // ─────────────────────────────────────
  if (type === "interactive") {
    const id =
      message.interactive?.button_reply?.id ||
      message.interactive?.list_reply?.id;

    return actionRouter(id, phone, session);
  }

  // ─────────────────────────────────────
  // GREETING FLOW
  // ─────────────────────────────────────
  const lower = textBody.toLowerCase();
  if (["hi", "hello", "hey"].includes(lower)) {
    return greetingFlow(phone, session);
  }

  // ─────────────────────────────────────
  // UPDATE PROFILE FLOW
  // ─────────────────────────────────────
  if (state && state.startsWith("update_profile")) {
    return updateProfileFlow(phone, user, textBody);
  }

  // ─────────────────────────────────────
  // AI FALLBACK
  // ─────────────────────────────────────
  return aiFallback(phone, textBody, session);
};