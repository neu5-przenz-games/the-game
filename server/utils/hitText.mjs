import { HIT_TYPES } from "./constants.mjs";
import { HP_MAX } from "../gameObjects/creatures/Player.mjs";

export const getHitText = (value) => {
  if (value >= HP_MAX * 0.4) {
    return HIT_TYPES.CRITICAL;
  }
  if (value >= HP_MAX * 0.2) {
    return HIT_TYPES.HARD;
  }
  return HIT_TYPES.NORMAL;
};
