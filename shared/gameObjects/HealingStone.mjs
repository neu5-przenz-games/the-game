import { GameObject } from "./GameObject.mjs";
import { getSurroundingTiles } from "../utils/index.mjs";

export class HealingStone extends GameObject {
  constructor({
    name,
    displayName,
    type = "HealingStone",
    positionTile,
    size = { x: 2, y: 2 },
    sizeToIncrease = { x: 4, y: 4 },
    healingDelayTicks = 10,
    healingDelayMaxTicks = 10,
    HP_REGEN_RATE = 2,
  }) {
    super({ name, displayName, type, positionTile, size });

    this.sizeToIncrease = sizeToIncrease;
    this.healingDelayTicks = healingDelayTicks;
    this.healingDelayMaxTicks = healingDelayMaxTicks;
    this.HP_REGEN_RATE = HP_REGEN_RATE;

    this.healingArea = getSurroundingTiles;
  }

  isPlayerInHealingArea(positionTile) {
    return this.healingArea({
      positionTile: this.positionTile,
      size: this.size,
      sizeToIncrease: this.sizeToIncrease,
    }).some(
      ({ tileX, tileY }) =>
        tileX === positionTile.tileX && tileY === positionTile.tileY
    );
  }
}
