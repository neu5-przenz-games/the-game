import { SKILLS_TYPES } from "../../skills/index.mjs";
import { Shield } from "../../gameItems/index.mjs";

export const shield = new Shield({
  id: "shield",
  displayName: "Shield",
  imgURL: "shield.png",
  skillToIncrease: {
    name: SKILLS_TYPES.SHIELD_DEFENDING,
    pointsToGain: 5,
  },
  details: {
    defense: 50,
  },
});

export const frozenShield = new Shield({
  id: "frozenShield",
  displayName: "Frozen shield",
  imgURL: "frozen_shield.png",
  skillToIncrease: {
    name: SKILLS_TYPES.SHIELD_DEFENDING,
    pointsToGain: 20,
  },
  details: {
    defense: 200,
  },
});

export const shields = [shield, frozenShield];
