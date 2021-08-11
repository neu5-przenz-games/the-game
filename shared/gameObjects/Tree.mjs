import GameObject from "./GameObject.mjs";
import { SKILLS_TYPES } from "../skills.mjs";

export default class Tree extends GameObject {
  constructor({
    name,
    displayName,
    type = "Tree",
    positionTile,
    size = { x: 1, y: 1 },
  }) {
    super({ name, displayName, type, positionTile, size });

    this.action = "chop";
    this.energyCost = 50;
    this.durationTicks = 150;
    this.skill = {
      name: SKILLS_TYPES.LUMBERJACKING,
      pointsToGain: 5,
    };
    this.item = {
      id: "wood",
      quantity: 1,
    };
  }
}
