import Phaser from "phaser";

export class HealingStone extends Phaser.GameObjects.Image {
  static hitAreaPoly = "16 16 40 4 54 20 54 40 64 72 0 70";

  constructor(scene, x, y, imageName, name, displayName) {
    super(scene, x + 32, y + 40, imageName);

    this.name = name;
    this.displayName = displayName;
    this.depth = y + 32;
  }
}
