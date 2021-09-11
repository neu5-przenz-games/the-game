import { GameObject } from "./GameObject.mjs";
import { SKILLS_TYPES } from "../skills/index.mjs";
import { copperOre } from "../init/gameItems/resource.mjs";

export class CopperOre extends GameObject {
  constructor({
    name,
    displayName,
    type = "Ore",
    positionTile,
    size = { x: 1, y: 1 },
    action = "mine",
    durationTicks = 150,
    energyCost = 50,
  }) {
    super({ name, displayName, type, positionTile, size });

    this.action = action;
    this.durationTicks = durationTicks;
    this.energyCost = energyCost;
    this.skill = {
      name: SKILLS_TYPES.MINING,
      pointsToGain: 5,
    };
    this.item = {
      id: copperOre.id,
      quantity: 1,
    };
  }
}
