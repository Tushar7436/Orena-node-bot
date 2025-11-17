// src/controllers/whatsappController.js

const { sendText } = require("../services/whatsappApi");
const { getOrCreateSession } = require("../services/sessionService");
const greetingFlow = require("../flows/greetingFlow");
const actionRouter = require("../flows/actionRouter");
const signupFlow = require("../flows/signupFlow");
const aiFallback = require("../ai/aiFallback");

exports.handleWebhook = async (req, res) => {
  res.sendStatus(200);

  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (!message) return;

  const phone = message.from;
  const type = message.type;
  const textBody = message.text?.body?.toLowerCase() || "";

  const session = await getOrCreateSession(phone);

  // 1. Handle button/list actions
  if (type === "interactive") {
    const id = message.interactive?.button_reply?.id ||
               message.interactive?.list_reply?.id;

    return actionRouter(id, phone, session);
  }

  // 2. Greeting flow
  if (["hi", "hello", "hey"].includes(textBody)) {
    return greetingFlow(phone, session);
  }

  // 3. Signup flow (ASK_NAME / ASK_EMAIL)
  const handleSignup = await signupFlow(phone, textBody);
  if (handleSignup.handled) return;

  // 4. AI fallback
  return aiFallback(phone, textBody, session);
};
