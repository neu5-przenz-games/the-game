import Phaser from "phaser";
import { EnergyBar, HealthBar, ProgressBar } from "./Bar";
import { TileFight, TileMarked, TileSelected } from "./Tile";
import Arrow from "./Arrow";

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
    endFrame: 11,
    speed: 0.15,
  },
  attack: {
    startFrame: 12,
    endFrame: 19,
    speed: 0.11,
  },
  die: {
    startFrame: 20,
    endFrame: 27,
    speed: 0.2,
  },
  shoot: {
    startFrame: 28,
    endFrame: 31,
    speed: 0.1,
  },
};

const MIN_TICK = 8;
const MAX_TICK = 12;

const HEALTH_BAR_OFFSET_X = -32;
const HEALTH_BAR_OFFSET_Y = -56;

const ENERGY_BAR_OFFSET_X = -32;
const ENERGY_BAR_OFFSET_Y = -50;

const PROGRESS_BAR_OFFSET_X = -32;
const PROGRESS_BAR_OFFSET_Y = 48;

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
  constructor({
    direction,
    isMainPlayer,
    hp,
    energy,
    isDead,
    name,
    displayName,
    scene,
    x,
    y,
  }) {
    super(
      scene,
      x + OFFSET.X,
      y + OFFSET.Y,
      "skeleton",
      directions[direction].offset
    );

    this.x = x + OFFSET.X;
    this.y = y + OFFSET.Y;

    this.name = name;
    this.displayName = displayName;
    this.dest = { x: null, y: null };
    this.isMainPlayer = isMainPlayer;
    this.isDead = isDead;
    this.tick = 0;
    this.maxTick = getRandomInt(MIN_TICK, MAX_TICK);

    this.healthBar = new HealthBar(
      scene,
      this.x,
      this.y,
      HEALTH_BAR_OFFSET_X,
      HEALTH_BAR_OFFSET_Y,
      hp
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

    if (isDead) {
      this.motion = "die";
      this.anim = anims[this.motion];
      this.f = this.anim.endFrame;
    } else {
      this.motion = "idle";
      this.anim = anims[this.motion];
      this.f = this.anim.startFrame;
    }

    this.frame = this.texture.get(this.direction.offset);

    this.label = this.scene.add
      .text(this.x, this.y, this.displayName)
      .setOrigin(0.5, 2)
      .setPosition(this.x, this.y - Skeleton.LABEL_OFFSET_Y);
    this.label.depth = this.depth;
  }

  static LABEL_OFFSET_Y = 8;

  static TYPE = "Skeleton";

  static hitAreaSize = {
    width: 64,
    height: 80,
  };

  setAlphaTiles(alpha = 1) {
    this.rangeTiles.forEach((tile) => {
      tile.setAlpha(alpha);
    });
  }

  showRange() {
    this.setAlphaTiles();

    const range = this.scene.equipment.weapon === "sword" ? 1 : 5;

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

  update({
    x,
    y,
    destTile,
    direction,
    attack,
    equipment,
    isDead,
    isWalking,
    selectedPlayer,
    hp,
  }) {
    this.tick += 1;

    this.isDead = isDead;

    if (attack !== null) {
      if (equipment.weapon === "sword") {
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
    } else if (isDead) {
      if (this.motion !== "die") {
        this.setMotion("die");
      }
    } else if (isWalking && !this.isFighting()) {
      if (this.motion !== "walk") {
        this.setMotion("walk");
      }
    } else if (!attack && !isWalking && !isDead && !this.isFighting()) {
      if (this.motion !== "idle") {
        this.setMotion("idle");
      }
    }

    if (this.tick === this.maxTick) {
      this.tick = 0;
      this.maxTick = getRandomInt(MIN_TICK, MAX_TICK);

      if (this.f === this.anim.endFrame) {
        if (
          this.motion !== "attack" &&
          this.motion !== "shoot" &&
          this.motion !== "die"
        ) {
          this.f = this.anim.startFrame;
        }
      } else {
        this.f += 1;
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
      if (selectedPlayer === null && destTile !== null) {
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
      if (this.isDead) {
        this.healthBar.hide();
      } else {
        this.healthBar.show();
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
      this.label.setPosition(this.x, this.y - Skeleton.LABEL_OFFSET_Y);

      this.tileSelected.setPosition(this.x, this.y);
      this.tileFight.setPosition(this.x, this.y);
    }

    if (this.healthBar.value !== hp) {
      this.healthBar.updateValue(hp);
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
