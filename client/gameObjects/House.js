import Phaser from "phaser";

export default class House extends Phaser.GameObjects.Image {
  static hitAreaPoly = "85 15 180 80 200 100 200 170 140 200 60 160 60 100";

  constructor(scene, x, y, name) {
    super(scene, x, y, name);

    this.depth = y + 64 - 1;
  }
}
