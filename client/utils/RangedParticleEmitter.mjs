import Phaser from "phaser";
import { getObjectTiles } from "../../shared/utils/index.mjs";

export class RangedParticleEmitter {
  constructor({
    scene,
    particleImgId,
    positionTile,
    mainObjectSize,
    timerDelay = 50,
    timerStartAt = 50,
    timerLoop = true,
    maxParticlesPerc = 50,
    particleDuration = 5000,
    sizeToIncrease = { x: 1, y: 1 },
    withoutMainObject = false,
  }) {
    this.scene = scene;
    this.particleImgId = particleImgId;
    this.particleDuration = particleDuration;

    this.rangeTiles = this.scene.groundLayer.getTilesWithin(
      positionTile.tileX - 1 - sizeToIncrease.x,
      positionTile.tileY - 1 - sizeToIncrease.y,
      sizeToIncrease.x * 2 + sizeToIncrease.x / 2,
      sizeToIncrease.y * 2 + sizeToIncrease.y / 2
    );

    if (withoutMainObject) {
      const mainObjectTiles = getObjectTiles({
        positionTile,
        size: mainObjectSize,
      });

      this.rangeTiles = this.rangeTiles.reduce((rangeTiles, tile) => {
        if (
          !mainObjectTiles.find(
            (mainObjTile) =>
              mainObjTile.tileX === tile.x && mainObjTile.tileY === tile.y
          )
        ) {
          rangeTiles.push(tile);
        }

        return rangeTiles;
      }, []);
    }

    this.particlesNum = 0;
    this.maxParticlesNum = Math.floor(
      (maxParticlesPerc / this.rangeTiles.length) * 100
    );

    const timedEvent = new Phaser.Time.TimerEvent({
      delay: timerDelay,
      startAt: timerStartAt,
      loop: timerLoop,
      callback: () => {
        this.throwParticles(this.scene);
      },
    });

    this.scene.time.addEvent(timedEvent);
  }

  throwParticles() {
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
}
