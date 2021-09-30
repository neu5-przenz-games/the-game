import { GameObject } from "./GameObject.mjs";

export class LootingBag extends GameObject {
  constructor({
    name,
    displayName = "Looting Bag",
    type = "LootingBag",
    positionTile,
    size = { x: 1, y: 1 },
    items = [],
  }) {
    super({ name, displayName, type, positionTile, size });

    this.items = items;
  }
}
