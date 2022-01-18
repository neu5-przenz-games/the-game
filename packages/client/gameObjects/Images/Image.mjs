import Phaser from "phaser";

export class Image {
  constructor({ scene, x, y, imageId }) {
    this.image = scene.add.image(x, y, imageId);
    this.image.setBlendMode(Phaser.BlendModes.ADD);
  }

  isVisible() {
    return this.image.visible;
  }

  hide() {
    this.image.visible = false;
  }

  show() {
    this.image.visible = true;
  }
}
