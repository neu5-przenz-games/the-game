import Phaser from "phaser";

const directions = {
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

export default class Skeleton extends Phaser.GameObjects.Image {
  constructor({
    direction,
    distance,
    isMainPlayer,
    motion,
    name,
    scene,
    x,
    y,
  }) {
    super(scene, x, y, "skeleton", direction.offset);

    this.name = name;
    this.startX = x;
    this.startY = y;
    this.destX = null;
    this.destY = null;
    this.distance = distance;
    this.isMainPlayer = isMainPlayer;

    this.motion = motion;
    this.anim = anims[motion];
    this.direction = directions[direction];
    this.speed = 0.15;
    this.walkSpeed = 2;
    this.f = this.anim.startFrame;

    this.depth = y + 64;

    this.scene = scene;
    // #fix #55
    this.label = this.scene.add.text(x - 32, y - 140, this.name);

    this.scene.time.delayedCall(
      this.anim.speed * 1000,
      this.changeFrame,
      [],
      this
    );
  }

  goTo(x, y) {
    this.destX = x;
    this.destY = y;

    this.makeMovement("walk");
  }

  makeMovement(movement) {
    this.motion = movement;
    this.anim = anims[this.motion];
    this.speed = anims[this.motion].speed;
    this.f = this.anim.startFrame;
    this.frame = this.texture.get(this.direction.offset + this.f);
  }

  resetAnimation() {
    this.f = this.anim.startFrame;

    this.frame = this.texture.get(this.direction.offset + this.f);

    this.scene.time.delayedCall(
      this.anim.speed * 1000,
      this.changeFrame,
      [],
      this
    );
  }

  changeFrame() {
    this.f += 1;

    let delay = this.anim.speed;

    if (this.f === this.anim.endFrame) {
      switch (this.motion) {
        case "walk":
          this.f = this.anim.startFrame;
          this.frame = this.texture.get(this.direction.offset + this.f);
          this.scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
          break;

        case "attack":
          delay = Math.random() * 2;
          this.scene.time.delayedCall(
            delay * 1000,
            this.resetAnimation,
            [],
            this
          );
          break;

        case "idle":
          delay = 0.5 + Math.random();
          this.scene.time.delayedCall(
            delay * 1000,
            this.resetAnimation,
            [],
            this
          );
          break;

        case "die":
          delay = 6 + Math.random() * 6;
          this.scene.time.delayedCall(
            delay * 1000,
            this.resetAnimation,
            [],
            this
          );
          break;
        default:
          delay = 0.5 + Math.random();
          this.scene.time.delayedCall(
            delay * 1000,
            this.resetAnimation,
            [],
            this
          );
          break;
      }
    } else {
      this.frame = this.texture.get(this.direction.offset + this.f);

      this.scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
    }
  }

  update() {
    if (this.motion === "walk") {
      if (this.x > this.destX) {
        if (this.y > this.destY) {
          this.x -= 1 * this.walkSpeed;
          this.y -= 1 * this.walkSpeed;
        } else {
          this.x -= 1 * this.walkSpeed;
          this.y += 1 * this.walkSpeed;
        }
      } else if (this.y > this.destY) {
        this.x += 1 * this.walkSpeed;
        this.y -= 1 * this.walkSpeed;
      } else {
        this.x += 1 * this.walkSpeed;
        this.y += 1 * this.walkSpeed;
      }

      if (
        Math.abs(this.x - this.destX) < 10 &&
        Math.abs(this.y - this.destY) < 10
      ) {
        this.destX = null;
        this.destY = null;

        this.makeMovement("idle");
      }
    }

    // #fix #55
    this.label.setPosition(this.x - 32, this.y - 140);
  }
}
