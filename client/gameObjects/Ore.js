import Phaser from "phaser";

export default class Ore extends Phaser.GameObjects.Image {
  constructor(scene, x, y, imageName, name) {
    super(scene, x + 32, y + 40, imageName);

    this.name = name;
    this.depth = y + 32;
  }
}
