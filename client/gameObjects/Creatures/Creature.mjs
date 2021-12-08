import Phaser from "phaser";
import { TileFight, TileMarked, TileSelected } from "../Tile/index.mjs";
import { Arrow } from "../Arrow.mjs";
import { DizzyImage } from "../Images/index.mjs";
import { getCurrentWeapon } from "../../../shared/init/gameItems/index.mjs";
import { PLAYER_STATES } from "../../../shared/constants/index.mjs";

const directions = {
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
    speed: 2,
  },
  walk: {
    startFrame: 4,
    endFrame: 11,
    speed: 1,
  },
  attack: {
    startFrame: 12,
    endFrame: 19,
    speed: 1,
  },
  parry: {
    startFrame: 12,
    endFrame: 19,
    speed: 0.2,
  },
  die: {
    startFrame: 20,
    endFrame: 27,
    speed: 2,
  },
  shoot: {
    startFrame: 28,
    endFrame: 31,
    speed: 1,
  },
};

const LABEL_OFFSET_Y = 25;

const OFFSET = {
  X: 32,
  Y: 16,
};

class Creature extends Phaser.GameObjects.Image {
  constructor({
    direction,
    isDead,
    name,
    displayName,
    scene,
    x,
    y,
    spriteName,
  }) {
    super(
      scene,
      x + OFFSET.X,
      y + OFFSET.Y,
      spriteName,
      directions[direction].offset
    );

    this.x = x + OFFSET.X;
    this.y = y + OFFSET.Y;

    this.name = name;
    this.displayName = displayName;
    this.dest = { x: null, y: null };
    this.isDead = isDead;

    this.tileMarked = new TileMarked(scene);
    this.tileSelected = new TileSelected(scene, this.x, this.y);
    this.tileFight = new TileFight(scene, this.x, this.y);

    this.arrow = new Arrow(scene, this.x, this.y);
    scene.add.existing(this.arrow);

    this.direction = directions[direction];

    this.depth = this.y;

    this.scene = scene;

    if (this.isDead) {
      this.motion = "die";
      this.anim = anims[this.motion];
      this.f = this.anim.endFrame - 1;
    } else {
      this.motion = "idle";
      this.anim = anims[this.motion];
      this.f = this.anim.startFrame;
    }

    this.speed = this.anim.speed;

    this.frame = this.texture.get(this.direction.offset);

    // buffs
    this.buffDizzy = new DizzyImage({
      scene: this.scene,
      x: this.x,
      y: this.y,
    });

    this.label = this.scene.add
      .text(this.x, this.y, this.getDisplayName(), {
        font: "12px Verdana",
        stroke: "#333",
        strokeThickness: 2,
      })
      .setOrigin(0.5, 2)
      .setPosition(this.x, this.y - LABEL_OFFSET_Y);
    this.label.depth = this.depth;

    this.scene.time.delayedCall(
      this.anim.speed * 100,
      this.changeFrame,
      [],
      this
    );
  }

  static hitAreaSize = {
    width: 64,
    height: 80,
  };

  getIsDead() {
    return this.isDead;
  }

  getCurrentPositionTile() {
    const { x, y } = this.scene.getTileFromXY(this.x, this.y);
    return { x, y };
  }

  getDisplayName() {
    return this.displayName;
  }

  isFighting() {
    return [12, 13, 14, 15, 16, 17, 18, 28, 29, 30].includes(this.f);
  }

  shoot(x, y) {
    this.scene.tweens.add({
      targets: this.arrow,
      x,
      y,
      ease: "Linear",
      duration: Math.abs(Phaser.Math.Distance.Between(this.x, this.y, x, y)),
      onComplete(tween, targets) {
        targets[0].setVisible(false);
      },
    });
  }

  setMotion(motion) {
    this.motion = motion;
    this.anim = anims[this.motion];
    this.f = this.anim.startFrame;
  }

  changeFrame() {
    this.f += 1;

    let delay = this.anim.speed;

    if (this.f === this.anim.endFrame) {
      if (this.motion === "walk") {
        this.f = this.anim.startFrame;
        this.frame = this.texture.get(this.direction.offset + this.f);
        this.scene.time.delayedCall(delay * 100, this.changeFrame, [], this);
      } else if (this.motion === "attack") {
        this.scene.time.delayedCall(delay * 100, this.resetAnimation, [], this);
      } else if (this.motion === "parry") {
        this.scene.time.delayedCall(delay * 100, this.resetAnimation, [], this);
      } else if (this.motion === "shoot") {
        this.scene.time.delayedCall(delay * 100, this.resetAnimation, [], this);
      } else if (this.motion === "idle") {
        delay = 0.1 + Math.random();

        this.scene.time.delayedCall(delay * 100, this.resetAnimation, [], this);
      } else if (this.motion === "die") {
        this.f -= 1;
        this.scene.time.delayedCall(delay * 100, this.changeFrame, [], this);
      }
    } else {
      this.frame = this.texture.get(this.direction.offset + this.f);

      this.scene.time.delayedCall(delay * 100, this.changeFrame, [], this);
    }
  }

  resetAnimation() {
    this.f = this.anim.startFrame;

    this.frame = this.texture.get(this.direction.offset + this.f);

    this.scene.time.delayedCall(
      this.anim.speed * 100,
      this.changeFrame,
      [],
      this
    );
  }

  update({
    x,
    y,
    direction,
    attack,
    weapon,
    isDead,
    isWalking,
    isParrying,
    state,
  }) {
    this.isDead = isDead;

    if (attack !== null) {
      if (getCurrentWeapon(weapon).details.range < 2) {
        if (this.motion !== "attack") {
          this.setMotion("attack");
        }
      } else if (this.motion !== "shoot") {
        this.setMotion("shoot");

        const player = this.scene.players.get(attack);

        this.arrow.setPosition(x + OFFSET.X, y + OFFSET.Y).setVisible(true);

        this.arrow.setAngle(
          Phaser.Math.RadToDeg(
            Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y)
          )
        );

        this.shoot(player.x, player.y);
      }
    } else if (this.isDead) {
      if (this.motion !== "die") {
        this.setMotion("die");
      }
    } else if (isWalking && !this.isFighting()) {
      if (this.motion !== "walk") {
        this.setMotion("walk");
      }
    } else if (isParrying) {
      if (this.motion !== "parry") {
        this.setMotion("parry");
      }
    } else if (!attack && !isWalking && !this.isDead && !this.isFighting()) {
      if (this.motion !== "idle") {
        this.setMotion("idle");
      }
    }

    // buffs
    if (state !== PLAYER_STATES.DIZZY && this.buffDizzy.isVisible() === true) {
      this.buffDizzy.hide();
    }
    if (state === PLAYER_STATES.DIZZY && this.buffDizzy.isVisible() === false) {
      this.buffDizzy.show();
    }

    if (
      this.scene.selectedObject &&
      this.scene.selectedObject.type === this.constructor.TYPE &&
      this.scene.selectedObject.name === this.name
    ) {
      if (this.scene.settings.fight) {
        this.tileFight.toggleVisible(true);
        this.tileSelected.toggleVisible(false);
      } else {
        this.tileSelected.toggleVisible(true);
        this.tileFight.toggleVisible(false);
      }
    } else {
      this.tileSelected.toggleVisible(false);
      this.tileFight.toggleVisible(false);
    }

    // player changed direction
    if (direction) {
      this.direction = directions[direction];
      this.frame = this.texture.get(this.direction.offset);
    }

    this.frame = this.texture.get(this.direction.offset + this.f);

    // player moved
    if (this.x !== x + OFFSET.X || this.y !== y + OFFSET.Y) {
      this.x = x + OFFSET.X;
      this.y = y + OFFSET.Y;

      this.depth = this.y + OFFSET.Y;
      this.label.depth = this.depth;
      this.label.setPosition(this.x, this.y - LABEL_OFFSET_Y);

      this.tileSelected.setPosition(this.x, this.y);
      this.tileFight.setPosition(this.x, this.y);
      this.buffDizzy.setPosition(this.x, this.y, this.depth);
    }
  }

  destroy() {
    this.arrow.destroy();
    this.label.destroy();
    super.destroy();
  }
}

export { directions, OFFSET, Creature };
