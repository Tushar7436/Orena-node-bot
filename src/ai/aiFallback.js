// src/ai/aiFallback.js

const { sendText } = require("../services/whatsappApi");
const axios = require("axios");

module.exports = async function aiFallback(phone, userMessage, session) {
  try {
    const response = await axios.post(
      process.env.PYTHON_BACKEND_URL,
      {
        message: userMessage,
        user_id: phone,
        session_token: session.session_token
      }
    );

    if (response.data?.ai_text) {
      return sendText(phone, response.data.ai_text);
    }

    return sendText(phone, "I'm having trouble understanding. Please try again.");
    
  } catch (err) {
    console.error("AI Backend Error:", err.response?.data || err.message);
    return sendText(phone, "AI service is temporarily unavailable.");
  }
};
