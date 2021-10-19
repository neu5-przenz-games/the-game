import {
  gameItems,
  getCurrentWeapon,
} from "../../../shared/init/gameItems/index.mjs";
import { MESSAGES_TYPES } from "../../../shared/UIMessages/index.mjs";
import { ITEM_TYPES } from "../../../shared/gameItems/index.mjs";
import {
  getChebyshevDistance,
  getDestTile,
  getXYFromTile,
} from "../../utils/algo.mjs";
import { isObjectAhead } from "../../utils/directions.mjs";

const HP_MAX = 1000;

class Devil {
  constructor({
    name,
    displayName,
    positionTile,
    size,
    dest,
    isWalking,
    isDead,
    equipment,
    backpack,
    selectedObject,
    selectedObjectTile,
    dropSelection,
    attack,
    attackDelayTicks,
    attackDelayMaxTicks,
    next,
    skills,
    speed,
    direction,
    hp,
  }) {
    this.name = name;
    this.displayName = displayName;

    // movement
    this.positionTile = positionTile;
    this.size = size;
    this.dest = dest;
    this.isWalking = isWalking;
    this.isDead = isDead;
    this.direction = direction;
    this.speed = speed;
    this.next = next;
    this.dropSelection = dropSelection;

    // settings
    this.equipment = equipment;
    this.backpack = backpack;
    this.selectedObject = selectedObject;
    this.selectedObjectTile = selectedObjectTile;

    // properties
    this.attack = attack;
    this.attackDelayTicks = attackDelayTicks;
    this.attackDelayMaxTicks = attackDelayMaxTicks;
    this.hp = hp;
    this.skills = skills;

    // generated
    const { x, y } = getXYFromTile(positionTile.tileX, positionTile.tileY);
    this.x = x;
    this.y = y;
    this.toRespawn = false;
    this.isParrying = false;
  }

  static DISPLAY_NAME = "Devil";

  static TYPE = "Devil";

  getFromBackpack(itemName) {
    return this.backpack.items.find((item) => item.id === itemName);
  }

  getWeaponRange() {
    return getCurrentWeapon(this.equipment.weapon).details.range;
  }

  setOnline(socketId) {
    this.isOnline = true;
    this.socketId = socketId;
  }

  setSelectedObject(player) {
    this.selectedObject = player;
  }

  setSettingsAttackAlly(value) {
    this.settings.attackAlly = value;
  }

  setSettingsFollow(value) {
    this.isWalking = false;
    this.settings.follow = value;
  }

  setSettingsFight(value) {
    this.settings.fight = value;
  }

  setSettingsShowRange(value) {
    this.settings.showRange = value;
  }

  setSettingsKeepSelectionOnMovement(value) {
    this.settings.keepSelectionOnMovement = value;
  }

  setWeapon(value) {
    this.equipment.weapon = value;
  }

  hasItems() {
    return (
      this.backpack.items.length > 0 || Object.keys(this.equipment).length > 0
    );
  }

  setBackpack(slots = 0, items = []) {
    this.backpack = {
      slots,
      items,
    };
  }

  setEquipment(items = {}) {
    this.equipment = {
      ...items,
    };
  }

  noObstacles = ({ PF, finder, map }) => {
    let noObstacle = true;

    if (this.hasRangedWeapon()) {
      const combatGrid = new PF.Grid(map.length, map.length);
      const combatPath = finder
        .findPath(
          this.positionTile.tileX,
          this.positionTile.tileY,
          this.selectedObject.positionTile.tileX,
          this.selectedObject.positionTile.tileY,
          combatGrid
        )
        .slice(1, -1);

      noObstacle = combatPath.every(([x, y]) => map[y][x] === 0);
    }

    return noObstacle;
  };

  isInRange(range) {
    return (
      getChebyshevDistance(
        this.positionTile,
        this.selectedObject.positionTile
      ) <= range
    );
  }

  hasTwoHandedWeapon() {
    return getCurrentWeapon(this.equipment.weapon).isTwoHanded;
  }

  hasRangedWeapon() {
    return this.getWeaponRange() > 1;
  }

  hasArrows() {
    return Boolean(this.equipment.arrows);
  }

  useArrow() {
    if (this.hasArrows()) {
      this.equipment.arrows.quantity -= 1;

      if (this.equipment.arrows.quantity === 0) {
        this.removeFromEquipment(this.equipment.arrows.id, ITEM_TYPES.ARROWS);
      }

      return true;
    }
    return false;
  }

  canAttack({ finder, map, PF }) {
    return (
      this.selectedObject.isDead === false &&
      this.energy >=
        getCurrentWeapon(this.equipment.weapon).details.energyCost &&
      this.attackDelayTicks >= this.attackDelayMaxTicks &&
      (this.settings.attackAlly ||
        !this.isSameFraction(this.selectedObject.fraction)) &&
      (this.hasRangedWeapon() ? this.hasArrows() : true) &&
      this.isInRange(this.getWeaponRange()) &&
      isObjectAhead(this, this.selectedObject) &&
      this.noObstacles({ finder, map, PF })
    );
  }

  canInteractWithLootingBag() {
    if (!this.isInRange(1)) {
      return MESSAGES_TYPES.NOT_IN_RANGE;
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
      this.resetSelected();

      if (this.action && this.actionDurationTicks !== null) {
        this.action = null;
        this.actionDurationTicks = null;
        this.actionDurationMax = null;
      }
    }
  }

  heal(value) {
    this.hp += value;

    if (this.hp > HP_MAX) {
      this.hp = HP_MAX;
    }
  }

  updateFollowing(map, players) {
    if (
      this.selectedObjectTile === null ||
      this.selectedObject.positionTile.tileX !==
        this.selectedObjectTile.tileX ||
      this.selectedObject.positionTile.tileY !== this.selectedObjectTile.tileY
    ) {
      this.selectedObjectTile = {
        tileX: this.selectedObject.positionTile.tileX,
        tileY: this.selectedObject.positionTile.tileY,
      };

      let obj = this.selectedObject;

      if (this.selectedObject.positionTile === undefined) {
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

  skillUpdate({ name, skill }) {
    this.skills = {
      ...this.skills,
      [name]: {
        ...skill,
      },
    };
  }

  destroyItem(itemName, equipmentItemType) {
    return equipmentItemType
      ? this.destroyItemFromEquipment(itemName, equipmentItemType)
      : this.destroyItemFromBackpack(itemName);
  }

  destroyItemFromBackpack(itemName) {
    try {
      this.backpack.items = this.backpack.items.reduce(
        (backpack, currentItem) => {
          if (currentItem.id !== itemName) {
            backpack.push(currentItem);
          }
          return backpack;
        },
        []
      );
      return true;
    } catch (err) {
      throw new Error(`Cannot destroy ${itemName} from backpack.`);
    }
  }

  destroyItemFromEquipment(itemName, equipmentItemType) {
    const item = this.equipment[equipmentItemType];

    if (itemName === item.id && delete this.equipment[equipmentItemType]) {
      const itemSchema = gameItems.get(item.id);

      if (itemSchema.type === ITEM_TYPES.BACKPACK) {
        this.setBackpack();
      }

      return true;
    }

    return false;
  }

  respawn(respawnTile) {
    this.isDead = false;
    this.toRespawn = false;
    this.hp = HP_MAX;

    const respawnXY = getXYFromTile(respawnTile.tileX, respawnTile.tileY);
    this.positionTile = respawnTile;
    this.x = respawnXY.x;
    this.y = respawnXY.y;
  }

  resetActionDuration() {
    if (Number.isInteger(this.actionDurationTicks)) {
      this.actionDurationTicks = null;
      this.actionDurationMax = null;

      return true;
    }

    return false;
  }

  resetSelected() {
    this.dropSelection = true;
  }
}

export { HP_MAX, Devil };
