const sessionModel = require("../models/sessionModel");

exports.getOrCreateSession = async (phone) => {
  // Check active session
  const active = await sessionModel.getActiveSession(phone);
  if (active) return active;

  // Expire all old sessions
  await sessionModel.expireOldSessions(phone);

  // Create new session
  return await sessionModel.createSession(phone);
};
