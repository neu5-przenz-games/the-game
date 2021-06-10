const { HIT_TYPES } = require("./constants");

const getHitType = (value) => {
  if (value >= 40) {
    return HIT_TYPES.CRITICAL;
  }
  if (value >= 20) {
    return HIT_TYPES.HARD;
  }
  return HIT_TYPES.NORMAL;
};

module.exports = {
  getHitType,
};
