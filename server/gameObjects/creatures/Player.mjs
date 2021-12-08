import { Creature } from "./Creature.mjs";
import { ENERGY_MAX, ENERGY_REGEN_RATE, HP_MAX } from "./constants.mjs";
import {
  getDestTile,
  getSelectedObject,
  noObstacles,
} from "../../utils/algo.mjs";
import { isObjectAhead } from "../../utils/directions.mjs";
import { getCurrentWeapon } from "../../../shared/init/gameItems/index.mjs";
import { MESSAGES_TYPES } from "../../../shared/UIMessages/index.mjs";
import { PLAYER_STATES } from "../../../shared/constants/index.mjs";
import { getXYFromTile } from "../../../shared/utils/index.mjs";

class Player extends Creature {
  constructor({
    displayName,
    fraction,
    receipt,
    action,
    actionDurationTicks,
    energyRegenDelayTicks,
    isOnline,
    socketId,
    energy,
    ...props
  }) {
    super(props);
    this.displayName = displayName;
    this.fraction = fraction;

    // properties
    this.action = action;
    this.receipt = receipt;
    this.actionDurationTicks = actionDurationTicks;
    this.energyRegenDelayTicks = energyRegenDelayTicks;
    this.energy = energy;

    // technical info
    this.socketId = socketId;
    this.isOnline = isOnline;

    // generated
    const { x, y } = getXYFromTile(
      this.positionTile.tileX,
      this.positionTile.tileY
    );
    this.x = x;
    this.y = y;
  }

  static TYPE = "Player";

  setOnline(socketId) {
    this.isOnline = true;
    this.socketId = socketId;
  }

  setSettingsAttackAlly(value) {
    this.settings.attackAlly = value;
  }

  setSettingsShowRange(value) {
    this.settings.showRange = value;
  }

  isSameFraction(fraction) {
    return this.fraction === fraction;
  }

  getState(players, map) {
    if (this.isDead) {
      this.setState(this.defaultState);
      return;
    }

    if (this.state === PLAYER_STATES.DIZZY) {
      this.selectedObjectName = null;
      this.selectedObjectTile = null;

      if (this.dest === null) {
        this.getNextDestination(map, players, PLAYER_STATES.DIZZY);
      }
    }
  }

  canAttack({ finder, map, selectedObject, PF }) {
    return (
      selectedObject.isDead === false &&
      this.isDead === false &&
      this.energy >=
        getCurrentWeapon(this.equipment.weapon).details.energyCost &&
      this.attackDelayTicks.value >= this.attackDelayTicks.maxValue &&
      (this.settings.attackAlly ||
        !this.isSameFraction(selectedObject.fraction)) &&
      (this.hasRangedWeapon() ? this.hasArrows() : true) &&
      this.isInRange(this.getWeaponRange(), selectedObject.positionTile) &&
      isObjectAhead({
        playerPositionTile: this.positionTile,
        playerDirection: this.direction,
        selectedObjectPositionTile: selectedObject.positionTile,
      }) &&
      noObstacles({
        finder,
        map,
        PF,
        positionTile: this.positionTile,
        selectedObjectPositionTile: selectedObject.positionTile,
        hasRangedWeapon: this.hasRangedWeapon(),
      })
    );
  }

  canGetResource(energyCost, gameObjects) {
    const { positionTile } = gameObjects.find(
      (obj) => obj.name === this.selectedObjectName
    );

    if (!this.isInRange(1, positionTile)) {
      return MESSAGES_TYPES.NOT_IN_RANGE;
    }
    if (this.energy < energyCost) {
      return MESSAGES_TYPES.NO_ENERGY;
    }
    return true;
  }

  canDoCrafting({ energyCost, requiredItems, requiredSkills }) {
    const hasResources = requiredItems.every((requiredItem) => {
      const foundItem = this.backpack.items.find(
        (item) => item.id === requiredItem.id
      );

      return foundItem && foundItem.quantity >= requiredItem.quantity;
    });

    if (!hasResources) {
      return MESSAGES_TYPES.NO_RESOURCES;
    }

    const hasSkills = requiredSkills.every(
      (requiredSkill) =>
        requiredSkill.points <= this.skills[requiredSkill.name].points
    );

    if (!hasSkills) {
      return MESSAGES_TYPES.NO_SKILL;
    }

    if (this.energy < energyCost) {
      return MESSAGES_TYPES.NO_ENERGY;
    }

    return true;
  }

  hit(value) {
    this.hp -= value;

    if (this.hp < 0) {
      this.hp = 0;
    }

    if (this.hp === 0) {
      this.energy = 0;
      this.isDead = true;
      this.buffs = [];
      this.dest = null;
      this.next = null;
      this.resetSelected();

      if (this.action && this.actionDurationTicks !== null) {
        this.action = null;
        this.actionDurationTicks = null;
      }
    }
  }

  updateFollowing(map, players, gameObjects) {
    const selectedObject = getSelectedObject({
      players,
      gameObjects,
      selectedObjectName: this.selectedObjectName,
    });

    if (
      this.selectedObjectTile === null ||
      selectedObject.positionTile.tileX !== this.selectedObjectTile.tileX ||
      selectedObject.positionTile.tileY !== this.selectedObjectTile.tileY
    ) {
      this.selectedObjectTile = {
        tileX: selectedObject.positionTile.tileX,
        tileY: selectedObject.positionTile.tileY,
      };

      let obj = { ...selectedObject };

      if (selectedObject.positionTile === undefined) {
        obj = {
          ...obj,
          positionTile: obj.positionTile,
        };
      }

      const { tileX, tileY } = getDestTile(this, {
        map,
        obj,
        players,
      });

      if (tileX && tileY) {
        this.dest = {
          ...getXYFromTile(tileX, tileY),
          tile: {
            tileX,
            tileY,
          },
        };
      }
    }
  }

  energyUse(value) {
    this.energy -= value;
  }

  energyRegenerate() {
    if (
      this.energyRegenDelayTicks.value >= this.energyRegenDelayTicks.maxValue &&
      !this.isDead &&
      this.energy < ENERGY_MAX
    ) {
      this.energy += ENERGY_REGEN_RATE;
      this.energyRegenDelayTicks.value = 0;

      if (this.energy > ENERGY_MAX) {
        this.energy = ENERGY_MAX;
      }
      return true;
    }
    return false;
  }

  respawn(respawnTile) {
    this.isDead = false;
    this.toRespawn = false;
    this.hp = HP_MAX;
    this.energy = ENERGY_MAX;

    const respawnXY = getXYFromTile(respawnTile.tileX, respawnTile.tileY);
    this.positionTile = respawnTile;
    this.x = respawnXY.x;
    this.y = respawnXY.y;
  }

  resetActionDuration() {
    if (this.actionDurationTicks !== null) {
      this.actionDurationTicks = null;

      return true;
    }

    return false;
  }
}

export { ENERGY_MAX, HP_MAX, Player };
