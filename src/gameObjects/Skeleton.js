import Phaser from "phaser";
import HealthBar from "./HealthBar";

export const directions = {
  west: { offset: 0, x: -2, y: 0, opposite: "east" },
  northWest: { offset: 32, x: -2, y: -1, opposite: "southEast" },
  north: { offset: 64, x: 0, y: -2, opposite: "south" },
  northEast: { offset: 96, x: 2, y: -1, opposite: "southWest" },
  east: { offset: 128, x: 2, y: 0, opposite: "west" },
  southEast: { offset: 160, x: 2, y: 1, opposite: "northWest" },
  south: { offset: 192, x: 0, y: 2, opposite: "north" },
  southWest: { offset: 224, x: -2, y: 1, opposite: "northEast" },
};

const anims = {
  idle: {
    startFrame: 0,
    endFrame: 4,
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

export const OFFSET = {
  X: 32,
  Y: 16,
};

export default class Skeleton extends Phaser.GameObjects.Image {
  constructor({ direction, isMainPlayer, hp, motion, name, scene, x, y }) {
    super(scene, x + OFFSET.X, y + OFFSET.Y, "skeleton", direction.offset);

    this.name = name;
    this.destX = null;
    this.destY = null;
    this.isMainPlayer = isMainPlayer;

    this.hp = new HealthBar(scene, x + OFFSET.X, y + OFFSET.Y, hp);

    this.motion = motion;
    this.anim = anims[motion];
    this.direction = directions[direction];
    this.speed = 0.15;
    this.walkSpeed = 2;
    this.f = this.anim.startFrame;

    this.depth = y + OFFSET.Y;

    this.scene = scene;

    this.label = this.scene.add.text(x, y, this.name).setOrigin(0.5, -1.0);
    this.label.depth = this.depth;
  }

  update() {
    if (this.nextDirection) {
      this.direction = this.nextDirection;
      this.frame = this.texture.get(this.direction.offset);
      this.nextDirection = null;
    }

    this.depth = this.y + OFFSET.Y;
    this.label.depth = this.depth;

    this.label.setPosition(this.x, this.y - this.displayHeight / 2);
    this.hp.setPosition(this.x, this.y);
  }
}
