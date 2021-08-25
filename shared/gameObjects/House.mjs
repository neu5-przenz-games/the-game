import { GameObject } from "./GameObject.mjs";

export class House extends GameObject {
  constructor({
    name,
    displayName,
    type = "House",
    positionTile,
    size = { x: 4, y: 3 },
  }) {
    super({ name, displayName, type, positionTile, size });
  }
}
