// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const webhookRoute = require('./routes/webhook');
const { sendGmail } = require("./utils/gmail");

const app = express();
app.use(cors());
app.use(express.json());

app.use('/webhook', webhookRoute);
app.use("/api", require("./routes/razorpay"));
app.use("/api/payment", require("./routes/payment"));

app.get("/test-email", async (req, res) => {
console.log("DEBUG ENV ----");
console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log("GMAIL_CLIENT_ID:", process.env.GMAIL_CLIENT_ID);
console.log("GMAIL_CLIENT_SECRET:", process.env.GMAIL_CLIENT_SECRET ? "OK" : "MISSING");
console.log("GMAIL_REDIRECT_URI:", process.env.GMAIL_REDIRECT_URI);
console.log("GMAIL_REFRESH_TOKEN:", process.env.GMAIL_REFRESH_TOKEN);

  try {
    await sendGmail("tushar7436@gmail.com", "Test", "Hello from backend");
    res.send("Email sent!");
  } catch (err) {
    console.error(err);
    res.send(err.message);
  }
});

// root
app.get('/', (req, res) => res.send('Orenna WhatsApp Bot is running'));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
