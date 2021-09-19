import Phaser from "phaser";
import { getCurrentWeapon } from "../../shared/init/gameItems/index.mjs";
import { EnergyBar, HealthBar, ProgressBar } from "./Bar/index.mjs";
import { TileFight, TileMarked, TileSelected } from "./Tile/index.mjs";
import { Arrow } from "./Arrow.mjs";

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

const HEALTH_BAR_OFFSET_X = -32;
const HEALTH_BAR_OFFSET_Y = -36;

const ENERGY_BAR_OFFSET_X = -32;
const ENERGY_BAR_OFFSET_Y = -30;

const LABEL_OFFSET_Y = 25;

const PROGRESS_BAR_OFFSET_X = -32;
const PROGRESS_BAR_OFFSET_Y = 48;

const OFFSET = {
  X: 32,
  Y: 16,
};

class Skeleton extends Phaser.GameObjects.Image {
  constructor({
    direction,
    isMainPlayer,
    energy,
    isDead,
    name,
    displayName,
    fraction,
    scene,
    x,
    y,
  }) {
    super(
      scene,
      x + OFFSET.X,
      y + OFFSET.Y,
      fraction,
      directions[direction].offset
    );

    this.x = x + OFFSET.X;
    this.y = y + OFFSET.Y;

    this.name = name;
    this.displayName = displayName;
    this.fraction = fraction;
    this.dest = { x: null, y: null };
    this.isMainPlayer = isMainPlayer;
    this.isDead = isDead;

    this.healthBar = new HealthBar(
      scene,
      this.x,
      this.y,
      HEALTH_BAR_OFFSET_X,
      HEALTH_BAR_OFFSET_Y,
      0,
      false
    );

    this.energyBar = new EnergyBar(
      scene,
      this.x,
      this.y,
      ENERGY_BAR_OFFSET_X,
      ENERGY_BAR_OFFSET_Y,
      energy,
      isMainPlayer
    );

    this.actionProgressBar = new ProgressBar(
      scene,
      this.x,
      this.y,
      PROGRESS_BAR_OFFSET_X,
      PROGRESS_BAR_OFFSET_Y,
      0,
      false
    );

    this.tileMarked = new TileMarked(scene);
    this.tileSelected = new TileSelected(scene, this.x, this.y);
    this.tileFight = new TileFight(scene, this.x, this.y);

    this.arrow = new Arrow(scene, this.x, this.y);
    scene.add.existing(this.arrow);

    this.direction = directions[direction];

    this.depth = this.y;

    this.scene = scene;

    this.rangeTiles = [];

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

  static TYPE = "Skeleton";

  static hitAreaSize = {
    width: 64,
    height: 80,
  };

  getIsDead() {
    return this.isDead;
  }

  getCurrentPositionTile() {
    const { x, y } = this.scene.groundLayer.worldToTileXY(this.x, this.y, true);
    return { x, y };
  }

  getDisplayName() {
    return `[${this.fraction.charAt(0)}] ${this.displayName}`;
  }

  setAlphaTiles(alpha = 1) {
    this.rangeTiles.forEach((tile) => {
      tile.setAlpha(alpha);
    });
  }

  showRange() {
    this.setAlphaTiles();

    const { range } = getCurrentWeapon(
      this.scene.equipment && this.scene.equipment.weapon
    ).details;

    const vec = this.scene.groundLayer.worldToTileXY(this.x, this.y, true);
    this.rangeTiles = this.scene.groundLayer.getTilesWithin(
      vec.x - range,
      vec.y - range,
      range * 2 + 1,
      range * 2 + 1
    );

    this.setAlphaTiles(0.8);
  }

  hideRange() {
    this.setAlphaTiles();
    this.rangeTiles = [];
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
      duration: 250,
      onComplete(tween, targets) {
        targets[0].setVisible(false);
      },
    });
  }

  actionStart(duration) {
    this.actionProgressBar.startCounter(duration);
  }

  actionEnd() {
    this.actionProgressBar.resetCounter();
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
    destTile,
    direction,
    attack,
    weapon,
    isDead,
    isWalking,
    isParrying,
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

    // Handle Main player only
    if (this.isMainPlayer) {
      if (destTile !== null) {
        // clear previous marker if it exists and if player is in movement
        if (
          this.tileMarked.visible === true &&
          (this.tileMarked.tileX !== destTile.tileX ||
            this.tileMarked.tileY !== destTile.tileY)
        ) {
          this.tileMarked.toggleVisible(false);
        }

        const tile = this.scene.groundLayer.tileToWorldXY(
          destTile.tileX,
          destTile.tileY
        );

        this.tileMarked.setPosition(tile.x + OFFSET.X, tile.y + OFFSET.Y);
        this.tileMarked.toggleVisible(true, tile);
      } else {
        this.tileMarked.toggleVisible(false);
      }

      if (this.scene.settings.showRange) {
        this.showRange();
      } else {
        this.hideRange();
      }
    } else if (!this.isMainPlayer) {
      // Handle other players only
      if (this.isDead || this.fraction !== this.scene.mainPlayer.fraction) {
        this.healthBar.hide();
      }
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
    }

    this.healthBar.setPosition(this.x, this.y, this.depth);
    this.energyBar.setPosition(this.x, this.y, this.depth);
    this.actionProgressBar.setPosition(this.x, this.y, this.depth);

    this.actionProgressBar.update();
  }

  destroy() {
    this.arrow.destroy();
    this.label.destroy();
    this.healthBar.destroy();
    this.energyBar.destroy();
    this.actionProgressBar.destroy();
    super.destroy();
  }
}

export { directions, OFFSET, Skeleton };
