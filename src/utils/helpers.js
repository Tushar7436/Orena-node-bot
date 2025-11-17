// src/utils/helpers.js
const sanitizePhone = (phone) => {
  // Normalize phone: remove spaces, plus signs. WhatsApp Cloud often sends phone numbers without country code change if required
  return phone.replace(/\s+/g, '').replace(/\+/g, '');
};

module.exports = { sanitizePhone };
