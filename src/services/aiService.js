exports.forwardUserMessage = async (phone, message, sessionToken) => {
  await axios.post(process.env.PYTHON_BACKEND_URL, {
    phone,
    message,
    session_token: sessionToken
  });
};
