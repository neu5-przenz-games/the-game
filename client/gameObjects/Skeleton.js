import Phaser from "phaser";
import HealthBar from "./HealthBar";
import { TileSelected, TileFight } from "./Tile";

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
  constructor({
    direction,
    isMainPlayer,
    hp,
    isDead,
    motion,
    name,
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
    this.dest = { x: null, y: null };
    this.markedDestTile = null;
    this.isMainPlayer = isMainPlayer;
    this.isDead = isDead;
    this.tick = 0;
    this.maxTick = getRandomInt(MIN_TICK, MAX_TICK);

    this.hp = new HealthBar(scene, this.x, this.y, hp);

    this.tileSelected = new TileSelected(scene, this.x, this.y);
    this.tileFight = new TileFight(scene, this.x, this.y);

    this.motion = motion;
    this.anim = anims[motion];
    this.direction = directions[direction];
    this.f = this.anim.startFrame;
    this.frame = this.texture.get(this.direction.offset);

    this.depth = this.y;

    this.scene = scene;

    this.label = this.scene.add
      .text(this.x, this.y, this.name)
      .setOrigin(0.5, -1.0)
      .setPosition(this.x, this.y - this.displayHeight / 2);
    this.label.depth = this.depth;
  }

  isFighting() {
    return [12, 13, 14, 15, 16, 17, 18].includes(this.f);
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
    isDead,
    isWalking,
    selectedPlayer,
    hp,
  }) {
    this.tick += 1;

    this.isDead = isDead;

    if (attack) {
      if (this.motion !== "attack") {
        this.setMotion("attack");
      }
    } else if (isDead) {
      if (this.motion !== "die") {
        this.setMotion("die");
      }

      if (this.isMainPlayer) {
        this.scene.profile.toggleRespawnButton(true);
        this.scene.resetSelectedObject();
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
        if (this.motion !== "attack" && this.motion !== "die") {
          this.f = this.anim.startFrame;
        }
      } else {
        this.f += 1;
      }
    }

    if (
      this.scene.selectedObject &&
      this.scene.selectedObject.type === this.constructor.name &&
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

    if (this.isMainPlayer && selectedPlayer === null && destTile !== null) {
      // clear previous marker if it exists and if player is in movement
      if (
        this.markedDestTile !== null &&
        (this.markedDestTile.x !== destTile.tileX ||
          this.markedDestTile.y !== destTile.tileY)
      ) {
        this.markedDestTile.clearAlpha();
        this.markedDestTile = null;
      }

      const tile = this.scene.groundLayer.getTileAt(
        destTile.tileX,
        destTile.tileY
      );

      tile.setAlpha(0.6);
      this.markedDestTile = tile;
    } else if (this.markedDestTile !== null) {
      this.markedDestTile.clearAlpha();
      this.markedDestTile = null;
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
      this.label.setPosition(this.x, this.y - this.displayHeight / 2);

      this.tileSelected.setPosition(this.x, this.y);
      this.tileFight.setPosition(this.x, this.y);
    }

    if (this.hp.value !== hp) {
      this.hp.updateValue(hp);
    }

    this.hp.setPosition(this.x, this.y);
  }
}
