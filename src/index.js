// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const webhookRoute = require('./routes/webhook');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/webhook', webhookRoute);
app.use("/api", require("./routes/razorpay"));
app.use("/api/payment", require("./routes/payment"));

// root
app.get('/', (req, res) => res.send('Orenna WhatsApp Bot is running'));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
