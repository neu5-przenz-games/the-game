import Phaser from "phaser";

export class Arrow extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, "arrow-bow");

    this.setDepth(Infinity);
    this.setScale(0.5, 0.5);
    this.visible = false;
  }
}
