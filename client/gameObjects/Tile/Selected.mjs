import { Tile } from "./Tile.mjs";

export class TileSelected extends Tile {
  constructor(scene, x, y) {
    super(scene, x, y, "tile-selected");
  }
}
