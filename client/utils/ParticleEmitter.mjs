import Phaser from "phaser";

export class ParticleEmitter {
  constructor({
    scene,
    particleImgId,
    particleScale = 1,
    x,
    y,
    objDepth,
    particleDuration = 1000,
  }) {
    this.scene = scene;
    this.particleImgId = particleImgId;
    this.x = x;
    this.y = y;
    this.objDepth = objDepth;
    this.particleDuration = particleDuration;

    this.particle = this.scene.add.image(this.x, this.y + 32, particleImgId);
    this.particle.setBlendMode(Phaser.BlendModes.ADD);
    this.particle.setScale(particleScale);
    this.particle.depth = this.objDepth + 1;

    this.scene.tweens.add({
      targets: [this.particle],
      alpha: { value: 0, duration: this.particleDuration, ease: "Linear" },
      x: this.x,
      y: this.y,
      ease: "Linear",
      duration: this.particleDuration,
      onComplete(tween, targets) {
        targets[0].setVisible(false);
      },
    });
  }
}
