import Phaser from "phaser";

export class Tree extends Phaser.GameObjects.Image {
  static hitAreaPoly =
    "85 10 145 55 140 120 120 140 85 140 85 185 75 185 75 135 65 145 5 105 10 60";

  constructor(scene, x, y, imageName, name, displayName) {
    super(scene, x + 32, y - 32, imageName);

    this.name = name;
    this.displayName = displayName;
    this.depth = y + 32;
  }
}
