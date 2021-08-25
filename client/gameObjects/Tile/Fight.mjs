import { Tile } from "./Tile.mjs";

export class TileFight extends Tile {
  constructor(scene, x, y) {
    super(scene, x, y, "tile-fight");
  }
}
