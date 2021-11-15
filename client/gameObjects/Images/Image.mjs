import Phaser from "phaser";

export class Image {
  constructor({ scene, x, y, imageId }) {
    this.image = scene.add.image(x, y, imageId);
    this.image.setBlendMode(Phaser.BlendModes.ADD);
  }
}
