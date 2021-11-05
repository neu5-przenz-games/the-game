export class ParticleEmitter {
  constructor({
    scene,
    particle,
    particleScale = 1,
    x,
    y,
    objDepth,
    particleDuration = 1000,
  }) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.particleDuration = particleDuration;

    this.particle = particle.image;
    this.particle.setScale(particleScale);
    this.particle.depth = objDepth + 1;

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
