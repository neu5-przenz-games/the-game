import { Creature } from "./Creature.mjs";
import { EnergyBar, HealthBar, ProgressBar } from "../Bar/index.mjs";
import { getCurrentWeapon } from "../../../shared/init/gameItems/index.mjs";

const HEALTH_BAR_OFFSET_X = -32;
const HEALTH_BAR_OFFSET_Y = -36;

const ENERGY_BAR_OFFSET_X = -32;
const ENERGY_BAR_OFFSET_Y = -30;

const PROGRESS_BAR_OFFSET_X = -32;
const PROGRESS_BAR_OFFSET_Y = 48;

const OFFSET = {
  X: 32,
  Y: 16,
};

class Player extends Creature {
  constructor({ fraction, energy, isMainPlayer, ...props }) {
    super({
      ...props,
      spriteName: fraction,
    });

    this.healthBar = new HealthBar(
      this.scene,
      this.x,
      this.y,
      HEALTH_BAR_OFFSET_X,
      HEALTH_BAR_OFFSET_Y,
      0,
      false
    );

    this.energyBar = new EnergyBar(
      this.scene,
      this.x,
      this.y,
      ENERGY_BAR_OFFSET_X,
      ENERGY_BAR_OFFSET_Y,
      energy,
      isMainPlayer
    );

    this.actionProgressBar = new ProgressBar(
      this.scene,
      this.x,
      this.y,
      PROGRESS_BAR_OFFSET_X,
      PROGRESS_BAR_OFFSET_Y,
      0,
      false
    );

    this.isMainPlayer = isMainPlayer;
    this.rangeTiles = [];
  }

  static TYPE = "Player";

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

  actionStart(duration) {
    this.actionProgressBar.startCounter(duration);
  }

  actionEnd() {
    this.actionProgressBar.resetCounter();
  }

  update({ destTile, ...props }) {
    super.update(props);

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

    this.healthBar.setPosition(this.x, this.y, this.depth);
    this.energyBar.setPosition(this.x, this.y, this.depth);
    this.actionProgressBar.setPosition(this.x, this.y, this.depth);

    this.actionProgressBar.update();
  }

  destroy() {
    super.destroy();

    this.healthBar.destroy();
    this.energyBar.destroy();
    this.actionProgressBar.destroy();
  }
}

export { OFFSET, Player };
