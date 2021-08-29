import Phaser from "phaser";
import { getObjectTiles } from "../../shared/utils/index.mjs";

export class HealingStone extends Phaser.GameObjects.Image {
  static hitAreaPoly = "16 16 40 4 54 20 54 40 64 72 0 70";

  constructor(scene, x, y, imageName, name, displayName) {
    super(scene, x + 32, y + 40, imageName);

    this.name = name;
    this.displayName = displayName;
    this.depth = y + 32;

    const gameObjectVec = this.scene.groundLayer.worldToTileXY(
      this.x,
      this.y,
      true
    );
    const range = 4;

    this.objectTiles = getObjectTiles({
      positionTile: { tileX: 10, tileY: 20 },
      size: { x: 2, y: 2 },
    });

    this.rangeTiles = scene.groundLayer.getTilesWithin(
      gameObjectVec.x - 1 - range,
      gameObjectVec.y - 1 - range,
      range * 2 + 2,
      range * 2 + 2
    );

    const timedEvent = new Phaser.Time.TimerEvent({
      delay: 50,
      startAt: 50,
      loop: true,
      callback: () => {
        this.throwParticles(scene);
      },
    });

    scene.time.addEvent(timedEvent);

    this.particlesNum = 0;
    this.MAX_PARTICLES_PERC = 50;
    this.MAX_PARTICLES_NUMBER = Math.floor(
      (this.MAX_PARTICLES_PERC / this.rangeTiles.length) * 100
    );
  }

  throwParticles(scene) {
    if (this.particlesNum <= this.MAX_PARTICLES_NUMBER) {
      const randomTileNum = Phaser.Math.Between(0, this.rangeTiles.length - 1);

      const particlePosition = scene.groundLayer.tileToWorldXY(
        this.rangeTiles[randomTileNum].x,
        this.rangeTiles[randomTileNum].y
      );

      // set particle in the middle of the tile
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

      const particle = scene.add.follower(path, 0, 0, "HealingStoneParticle");

      particle.depth = particlePosition.y + 8;
      this.particlesNum += 1;

      const self = this;

      particle.startFollow({
        positionOnPath: true,
        duration: 6000,
        onCompleteParams: [self],
        onComplete() {
          self.particlesNum -= 1;
          particle.destroy();
        },
      });
    }
  }
}
