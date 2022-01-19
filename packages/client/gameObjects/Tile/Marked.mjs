import { Tile } from "./Tile.mjs";

export class TileMarked extends Tile {
  constructor(scene, x, y) {
    super(scene, x, y, "tile-marked");

    this.tileX = -1;
    this.tileY = -1;
  }

  setTiles({ x, y }) {
    this.tileX = x;
    this.tileY = y;
  }

  resetTiles() {
    this.tileX = -1;
    this.tileY = -1;
  }

  toggleVisible(visible, tile) {
    super.toggleVisible(visible);

    if (visible) {
      this.setTiles(tile);
    } else {
      this.resetTiles();
    }
  }
}
