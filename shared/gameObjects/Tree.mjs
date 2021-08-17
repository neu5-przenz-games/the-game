import GameObject from "./GameObject.mjs";
import { SKILLS_TYPES } from "../skills/index.mjs";

export default class Tree extends GameObject {
  constructor({
    name,
    displayName,
    type = "Tree",
    positionTile,
    size = { x: 1, y: 1 },
    energyCost = 50,
    durationTicks = 150,
  }) {
    super({ name, displayName, type, positionTile, size });

    this.action = "chop";
    this.energyCost = energyCost;
    this.durationTicks = durationTicks;
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
