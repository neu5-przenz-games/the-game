import Phaser from "phaser";

export class Particle {
  constructor(scene, x, y, particleImgId) {
    this.image = scene.add.image(x, y + 32, particleImgId);
    this.image.setBlendMode(Phaser.BlendModes.ADD);
  }
}
