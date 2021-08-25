import Phaser from "phaser";

export class Ore extends Phaser.GameObjects.Image {
  constructor(scene, x, y, imageName, name, displayName) {
    super(scene, x + 32, y + 40, imageName);

    this.name = name;
    this.displayName = displayName;
    this.depth = y + 32;
  }
}
