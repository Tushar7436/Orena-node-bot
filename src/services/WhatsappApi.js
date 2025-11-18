// src/services/WhatsappApi.js
const axios = require('axios');


const PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v24.0';

if (!PHONE_ID || !TOKEN) {
  console.warn("⚠️ Missing WhatsApp credentials");
}

const send = async (toPhone, payload) => {
  const url = `${API_URL}/${PHONE_ID}/messages`;

  try {
    const res = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
      }
    });
    return res.data;
  } catch (err) {
    console.error("WhatsApp API Error:", err.response?.data || err);
    throw err;
  }
};

// -------------------
// SEND PLAIN TEXT
// -------------------
const sendText = (toPhone, text) => {
  return send(toPhone, {
    messaging_product: "whatsapp",
    to: toPhone,
    type: "text",
    text: { body: text }
  });
};

// -------------------
// SEND BUTTONS (max 3)
// -------------------
const sendButtons = (toPhone, headerText, buttonsArray, bodyText = "", footerText = "") => {
  const buttons = (buttonsArray || []).map(b => {
    
    // 🔗 URL BUTTON SUPPORT
    if (b.type === "url") {
      return {
        type: "url",
        url: b.url,
        title: b.title
      };
    }

    // 🔵 REPLY BUTTON (default)
    return {
      type: "reply",
      reply: { id: b.id, title: b.title }
    };
  });

  return send(toPhone, {
    messaging_product: "whatsapp",
    to: toPhone,
    type: "interactive",
    interactive: {
      type: "button",
      header: { type: "text", text: headerText },
      body: { text: bodyText },
      footer: footerText ? { text: footerText } : undefined,
      action: { buttons }
    }
  });
};

// ---------------------
// SEND LIST MENU
// ---------------------
const sendList = (toPhone, headerText, bodyText, footerText, sections) => {
  return send(toPhone, {
    messaging_product: "whatsapp",
    to: toPhone,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: headerText },
      body: { text: bodyText },
      footer: footerText ? { text: footerText } : undefined,
      action: {
        button: "Choose an option",
        sections
      }
    }
  });
};

module.exports = {
  send,
  sendText,
  sendButtons,
  sendList
};
