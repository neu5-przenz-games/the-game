import { HIT_TYPES } from "./constants.mjs";

export const getHitText = (value) => {
  if (value >= 40) {
    return HIT_TYPES.CRITICAL;
  }
  if (value >= 20) {
    return HIT_TYPES.HARD;
  }
  return HIT_TYPES.NORMAL;
};
