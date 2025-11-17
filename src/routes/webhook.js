// src/routes/webhook.js
const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../controllers/whatsappController');

/**
 * WhatsApp Cloud API webhook:
 * GET for verification
 * POST for messages
 */
router.get('/', (req, res) => {
  // webhook verification
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else return res.sendStatus(403);
  }
  res.sendStatus(200);
});

router.post('/', express.json({ limit: '5mb' }), handleWebhook);

module.exports = router;
