import Phaser from "phaser";

export class House extends Phaser.GameObjects.Image {
  static hitAreaPoly = "85 15 180 80 200 100 200 170 140 200 60 160 60 100";

  constructor(scene, x, y, imageName, name, displayName) {
    super(scene, x + 64, y + 32, imageName);

    this.name = name;
    this.displayName = displayName;
    this.depth = y + 96 - 8;
  }
}
