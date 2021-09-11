import { GameObject } from "./GameObject.mjs";
import { SKILLS_TYPES } from "../skills/index.mjs";
import { wood } from "../init/gameItems/resource.mjs";

export class Tree extends GameObject {
  constructor({
    name,
    displayName,
    type = "Tree",
    positionTile,
    size = { x: 1, y: 1 },
    action = "chop",
    durationTicks = 150,
    energyCost = 50,
  }) {
    super({ name, displayName, type, positionTile, size });

    this.action = action;
    this.durationTicks = durationTicks;
    this.energyCost = energyCost;
    this.skill = {
      name: SKILLS_TYPES.LUMBERJACKING,
      pointsToGain: 5,
    };
    this.item = {
      id: wood.id,
      quantity: 1,
    };
  }
}
