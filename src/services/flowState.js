// SIMPLE IN-MEMORY FLOW TRACKING
const flowState = {};

module.exports = {
  get(phone) {
    if (!flowState[phone]) {
      flowState[phone] = { state: "none" };
    }
    return flowState[phone];
  },

  set(phone, newState) {
    if (!flowState[phone]) {
      flowState[phone] = {};
    }
    flowState[phone].state = newState;
  },

  setTemp(phone, key, value) {
    if (!flowState[phone]) {
      flowState[phone] = {};
    }
    flowState[phone][key] = value;
  },

  clearTemp(phone) {
    if (!flowState[phone]) return;
    
    const { state } = flowState[phone];
    flowState[phone] = { state }; // Keep only the state
  },

  reset(phone) {
    flowState[phone] = { state: "none" };
  }
};