import Phaser from "phaser";
import HealthBar from "./HealthBar";

export const directions = {
  west: { offset: 0 },
  northWest: { offset: 32 },
  north: { offset: 64 },
  northEast: { offset: 96 },
  east: { offset: 128 },
  southEast: { offset: 160 },
  south: { offset: 192 },
  southWest: { offset: 224 },
};

const anims = {
  idle: {
    startFrame: 0,
    endFrame: 3,
    speed: 0.2,
  },
  walk: {
    startFrame: 4,
    endFrame: 12,
    speed: 0.15,
  },
  attack: {
    startFrame: 12,
    endFrame: 20,
    speed: 0.11,
  },
  die: {
    startFrame: 20,
    endFrame: 28,
    speed: 0.2,
  },
  shoot: {
    startFrame: 28,
    endFrame: 32,
    speed: 0.1,
  },
};

const MIN_TICK = 8;
const MAX_TICK = 12;

const getRandomInt = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
};

export const OFFSET = {
  X: 32,
  Y: 16,
};

export default class Skeleton extends Phaser.GameObjects.Image {
  constructor({ direction, isMainPlayer, hp, motion, name, scene, x, y }) {
    super(
      scene,
      x + OFFSET.X,
      y + OFFSET.Y,
      "skeleton",
      directions[direction].offset
    );

    this.name = name;
    this.destX = null;
    this.destY = null;
    this.isMainPlayer = isMainPlayer;
    this.tick = 0;
    this.maxTick = getRandomInt(MIN_TICK, MAX_TICK);

    this.hp = new HealthBar(scene, x + OFFSET.X, y + OFFSET.Y, hp);

    this.motion = motion;
    this.anim = anims[motion];
    this.direction = directions[direction];
    this.speed = 0.15;
    this.f = this.anim.startFrame;
    this.frame = this.texture.get(this.direction.offset);

    this.depth = y + OFFSET.Y;

    this.scene = scene;

    this.label = this.scene.add.text(x, y, this.name).setOrigin(0.5, -1.0);
    this.label.depth = this.depth;
  }

  isMoving() {
    return this.motion === "walk";
  }

  hasDestination() {
    return this.destTileX !== null && this.destTileY !== null;
  }

  update(x, y, nextDirection, tileX, tileY, destTileX, destTileY) {
    this.tick += 1;

    this.destTileX = destTileX;
    this.destTileY = destTileY;

    this.tileX = tileX;
    this.tileY = tileY;

    if (this.x === x && this.y === y) {
      if (this.motion !== "idle") {
        this.motion = "idle";
        this.anim = anims[this.motion];
        this.f = this.anim.startFrame;
      }
    } else {
      if (this.motion !== "walk") {
        this.motion = "walk";
        this.anim = anims[this.motion];
        this.f = this.anim.startFrame;
      }

      this.x = x;
      this.y = y;
    }

    if (this.tick === this.maxTick) {
      this.tick = 0;
      this.maxTick = getRandomInt(MIN_TICK, MAX_TICK);

      if (this.f === this.anim.endFrame) {
        this.f = this.anim.startFrame;
      } else {
        this.f += 1;
      }
    }

    if (nextDirection) {
      this.direction = directions[nextDirection];
      this.frame = this.texture.get(this.direction.offset);
    }

    this.frame = this.texture.get(this.direction.offset + this.f);

    this.depth = this.y + OFFSET.Y;
    this.label.depth = this.depth;
    this.label.setPosition(this.x, this.y - this.displayHeight / 2);
    this.hp.setPosition(this.x, this.y);
  }
}
