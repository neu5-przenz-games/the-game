import GameObject from "./GameObject.mjs";
import { SKILLS_TYPES } from "../skills.mjs";

export default class CopperOre extends GameObject {
  constructor({
    name,
    displayName,
    type = "Ore",
    positionTile,
    size = { x: 1, y: 1 },
  }) {
    super({ name, displayName, type, positionTile, size });

    this.action = "mine";
    this.durationTicks = 30;
    this.energyCost = 50;
    this.skill = {
      name: SKILLS_TYPES.MINING,
      pointsToGain: 5,
    };
    this.item = {
      id: "copper ore",
      quantity: 1,
    };
  }
}
