import { GameObject } from "./GameObject.mjs";

export class HealingStone extends GameObject {
  constructor({
    name,
    displayName,
    type = "HealingStone",
    positionTile,
    size = { x: 2, y: 2 },
    sizeToIncrease = { x: 4, y: 4 },
    healingDelayTicks = { value: 10, maxValue: 10 },
    HP_REGEN_RATE = 5,
    healingArea = [],
  }) {
    super({ name, displayName, type, positionTile, size });

    this.sizeToIncrease = sizeToIncrease;
    this.healingDelayTicks = healingDelayTicks;
    this.HP_REGEN_RATE = HP_REGEN_RATE;
    this.healingArea = healingArea;
  }
}
