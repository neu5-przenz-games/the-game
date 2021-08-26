import { HIT_TYPES } from "./constants.mjs";

export const getHitText = (value) => {
  if (value >= 400) {
    return HIT_TYPES.CRITICAL;
  }
  if (value >= 200) {
    return HIT_TYPES.HARD;
  }
  return HIT_TYPES.NORMAL;
};
