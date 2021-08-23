import { SKILLS_TYPES } from "../../skills/index.mjs";
import { Shield } from "../../gameItems/index.mjs";

const shield = new Shield({
  id: "shield",
  displayName: "Shield",
  imgURL: "shield.png",
  skillToIncrease: {
    name: SKILLS_TYPES.SHIELD_DEFENDING,
    pointsToGain: 5,
  },
  details: {
    defence: 5,
  },
});

export const shields = [shield];
