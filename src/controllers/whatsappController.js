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

  // ─────────────────────────────────────
  // 1. Handle INTERACTIVE BUTTON / LIST
  // ─────────────────────────────────────
  if (type === "interactive") {
    const id =
      message.interactive?.button_reply?.id ||
      message.interactive?.list_reply?.id;

    return actionRouter(id, phone, session);
  }

  // ─────────────────────────────────────
  // 2. Greeting Flow
  // ─────────────────────────────────────
  const lower = textBody.toLowerCase();
  if (["hi", "hello", "hey"].includes(lower)) {
    return greetingFlow(phone, session);
  }

  // ─────────────────────────────────────
  // 3. SIGNUP FLOW
  // ─────────────────────────────────────
  const signupResult = await signupFlow(phone, textBody);
  if (signupResult?.handled) return;

  // ─────────────────────────────────────
  // 4. UPDATE PROFILE FLOW
  // ─────────────────────────────────────
  const state = Flow.get(phone)?.state;

  if (state && state.startsWith("update_profile")) {
    return updateProfileFlow(phone, user, textBody);
  }

  // ─────────────────────────────────────
  // 5. AI FALLBACK (Python backend or Gemini)
  // ─────────────────────────────────────
  return aiFallback(phone, textBody, session);
};
