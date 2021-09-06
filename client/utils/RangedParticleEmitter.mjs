import Phaser from "phaser";

export class RangedParticleEmitter {
  constructor({
    scene,
    particleImgId,
    rangeTiles,
    timerDelay = 50,
    timerStartAt = 50,
    timerLoop = true,
    maxParticlesPerc = 50,
    particleDuration = 5000,
    particlesNum = 0,
  }) {
    this.scene = scene;
    this.particleImgId = particleImgId;
    this.particleDuration = particleDuration;
    this.rangeTiles = rangeTiles;
    this.timerDelay = timerDelay;
    this.timerStartAt = timerStartAt;
    this.timerLoop = timerLoop;

    this.particlesNum = particlesNum;

    this.maxParticlesNum = Math.floor(
      (maxParticlesPerc / this.rangeTiles.length) * 100
    );
    this.timedEvent = null;
  }

  update() {
    if (this.particlesNum <= this.maxParticlesNum) {
      const randomTileNum = Phaser.Math.Between(0, this.rangeTiles.length - 1);

      const particlePosition = this.scene.groundLayer.tileToWorldXY(
        this.rangeTiles[randomTileNum].x,
        this.rangeTiles[randomTileNum].y
      );

      // set particle in the middle of the tile
      // this could be configurable in the future
      particlePosition.x += 32;
      particlePosition.y += 48;

      const upBy = 10;
      const sidesBy = 5;

      const path = new Phaser.Curves.Path(
        particlePosition.x + sidesBy,
        particlePosition.y
      ).splineTo([
        particlePosition.x - sidesBy,
        particlePosition.y - upBy,
        particlePosition.x + sidesBy,
        particlePosition.y - upBy * 2,
        particlePosition.x - sidesBy,
        particlePosition.y - upBy * 3,
      ]);

      const particle = this.scene.add.follower(path, 0, 0, this.particleImgId);

      particle.depth = particlePosition.y + 8;
      this.particlesNum += 1;

      const self = this;

      particle.startFollow({
        positionOnPath: true,
        duration: this.particleDuration,
        onCompleteParams: [self],
        onComplete() {
          self.particlesNum -= 1;
          particle.destroy();
        },
      });
    }
  }

  start() {
    this.timedEvent = new Phaser.Time.TimerEvent({
      delay: this.timerDelay,
      startAt: this.timerStartAt,
      loop: this.timerLoop,
      callback: () => {
        this.update(this.scene);
      },
    });

    this.scene.time.addEvent(this.timedEvent);
  }
}
