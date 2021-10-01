import {
  gameItems,
  getCurrentWeapon,
} from "../../shared/init/gameItems/index.mjs";
import { MESSAGES_TYPES } from "../../shared/UIMessages/index.mjs";
import { ITEM_TYPES, WEARABLE_TYPES } from "../../shared/gameItems/index.mjs";
import {
  getChebyshevDistance,
  getDestTile,
  getXYFromTile,
} from "../utils/algo.mjs";
import { isObjectAhead } from "../utils/directions.mjs";

const ENERGY_REGEN_RATE = 3;
const ENERGY_MAX = 1000;
const HP_MAX = 1000;

class Player {
  constructor({
    name,
    displayName,
    fraction,
    positionTile,
    size,
    dest,
    isWalking,
    isDead,
    equipment,
    backpack,
    settings,
    selectedPlayer,
    selectedPlayerTile,
    dropSelection,
    receipt,
    action,
    actionDurationTicks,
    actionDurationMaxTicks,
    attack,
    attackDelayTicks,
    attackDelayMaxTicks,
    energyRegenDelayTicks,
    energyRegenDelayMaxTicks,
    next,
    skills,
    speed,
    isOnline,
    socketId,
    direction,
    hp,
    energy,
  }) {
    this.name = name;
    this.displayName = displayName;
    this.fraction = fraction;

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
    this.settings = settings;
    this.selectedPlayer = selectedPlayer;
    this.selectedPlayerTile = selectedPlayerTile;

    // properties
    this.action = action;
    this.receipt = receipt;
    this.actionDurationTicks = actionDurationTicks;
    this.actionDurationMaxTicks = actionDurationMaxTicks;
    this.attack = attack;
    this.attackDelayTicks = attackDelayTicks;
    this.attackDelayMaxTicks = attackDelayMaxTicks;
    this.energyRegenDelayTicks = energyRegenDelayTicks;
    this.energyRegenDelayMaxTicks = energyRegenDelayMaxTicks;
    this.hp = hp;
    this.energy = energy;
    this.skills = skills;
    // technical info
    this.socketId = socketId;
    this.isOnline = isOnline;

    // generated
    const { x, y } = getXYFromTile(positionTile.tileX, positionTile.tileY);
    this.x = x;
    this.y = y;
    this.toRespawn = false;
    this.isParrying = false;
  }

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
    this.selectedPlayer = player;
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

  addToBackpack(newItems) {
    if (!this.canAddToBackpack(newItems.length)) {
      return false;
    }

    newItems.forEach((newItem) => {
      const item = this.backpack.items.find((i) => i.id === newItem.id);

      if (item) {
        item.quantity += newItem.quantity;
      } else {
        this.backpack.items.push(newItem);
      }
    });

    return true;
  }

  moveToBackpackFromEquipment(itemName, equipmentItemType) {
    const item = this.equipment[equipmentItemType];

    if (itemName !== item.id) {
      return false;
    }

    const itemSchema = gameItems.get(item.id);

    if (itemSchema.type === ITEM_TYPES.BACKPACK) {
      return false;
    }

    if (itemSchema.type === ITEM_TYPES.QUIVER && this.hasArrows()) {
      const { arrows } = this.equipment;
      if (!this.addToBackpack([item, arrows])) {
        return false;
      }

      this.removeFromEquipment(arrows.id, ITEM_TYPES.ARROWS);
    } else if (!this.addToBackpack([item])) {
      return false;
    }

    this.removeFromEquipment(itemName, equipmentItemType);

    return true;
  }

  removeFromBackpack(itemName) {
    const item = this.getFromBackpack(itemName);

    if (!item) {
      return false;
    }

    const itemSchema = gameItems.get(item.id);

    if (itemSchema.type === ITEM_TYPES.ARROWS) {
      this.destroyItemFromBackpack(itemName);
    } else if (item.quantity > 1) {
      item.quantity -= 1;
    } else if (!this.destroyItemFromBackpack(itemName)) {
      return false;
    }

    return true;
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

  addToEquipment(item) {
    const itemSchema = gameItems.get(item.id);

    if (!itemSchema || !WEARABLE_TYPES.includes(itemSchema.type)) {
      return false;
    }

    const itemFromEquipment = this.equipment[itemSchema.type];
    if (
      itemFromEquipment &&
      !this.moveToBackpackFromEquipment(itemFromEquipment.id, itemSchema.type)
    ) {
      return false;
    }

    if (
      itemSchema.type === ITEM_TYPES.ARROWS &&
      this.equipment.quiver === undefined
    ) {
      return false;
    }

    this.equipment[itemSchema.type] = item;

    if (itemSchema.type === ITEM_TYPES.WEAPON) {
      this.attackDelayTicks = 0;
      this.attackDelayMaxTicks = itemSchema.details.attackDelayTicks;
    }

    return true;
  }

  moveBackpackToEquipment(itemName) {
    const item = this.getFromBackpack(itemName);
    const itemSchema = gameItems.get(item.id);
    const currentBackpack = this.equipment.backpack;
    const backpackItems = this.backpack.items;

    const { slots } = itemSchema;

    this.setBackpack(slots, [
      ...(backpackItems.length >= slots
        ? backpackItems.slice(0, slots)
        : backpackItems),
      currentBackpack,
    ]);

    this.destroyItemFromBackpack(itemName);
    this.equipment.backpack = item;
  }

  moveTwoHandedWeaponToEquipment(itemName) {
    const item = this.getFromBackpack(itemName);

    if (
      this.canAddToBackpack(this.equipment.weapon?.id ? 1 : 0) &&
      this.removeFromBackpack(itemName) &&
      this.addToEquipment(item) &&
      this.moveToBackpackFromEquipment(
        this.equipment.shield.id,
        ITEM_TYPES.SHIELD
      )
    ) {
      return true;
    }

    return false;
  }

  moveShieldToEquipment(itemName) {
    const item = this.getFromBackpack(itemName);

    if (
      this.removeFromBackpack(itemName) &&
      this.addToEquipment(item) &&
      this.moveToBackpackFromEquipment(
        this.equipment.weapon.id,
        ITEM_TYPES.WEAPON
      )
    ) {
      return true;
    }

    return false;
  }

  moveToEquipmentFromBackpack(itemName) {
    const item = this.getFromBackpack(itemName);

    const itemSchema = gameItems.get(item.id);

    if (!WEARABLE_TYPES.includes(itemSchema.type)) {
      return false;
    }

    if (itemSchema.type === ITEM_TYPES.BACKPACK) {
      this.moveBackpackToEquipment(itemName);
    }
    // player wants to wear two-handed weapon and wears the shield
    else if (itemSchema.isTwoHanded && this.equipment.shield !== undefined) {
      return this.moveTwoHandedWeaponToEquipment(itemName);
    }
    // player wants to wear shield
    else if (
      itemSchema.type === ITEM_TYPES.SHIELD &&
      this.hasTwoHandedWeapon()
    ) {
      return this.moveShieldToEquipment(itemName);
    } else {
      // player has to wear quiver if wants to wear arrows
      if (
        itemSchema.type === ITEM_TYPES.ARROWS &&
        this.equipment.quiver === undefined
      ) {
        return false;
      }

      if (!this.removeFromBackpack(itemName)) {
        this.removeFromEquipment(itemName, gameItems.get(itemName));

        return false;
      }
      if (!this.addToEquipment(item)) {
        return false;
      }
    }

    return true;
  }

  removeFromEquipment(itemName, equipmentItemType) {
    return this.destroyItemFromEquipment(itemName, equipmentItemType);
  }

  canAddToBackpack(itemsToAddNum) {
    return itemsToAddNum <= this.backpack.slots - this.backpack.items.length;
  }

  noObstacles = ({ PF, finder, map }) => {
    let noObstacle = true;

    if (this.hasRangedWeapon()) {
      const combatGrid = new PF.Grid(map.length, map.length);
      const combatPath = finder
        .findPath(
          this.positionTile.tileX,
          this.positionTile.tileY,
          this.selectedPlayer.positionTile.tileX,
          this.selectedPlayer.positionTile.tileY,
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
        this.selectedPlayer.positionTile
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
      this.selectedPlayer.isDead === false &&
      this.energy >=
        getCurrentWeapon(this.equipment.weapon).details.energyCost &&
      this.attackDelayTicks >= this.attackDelayMaxTicks &&
      this.fraction !== this.selectedPlayer.fraction &&
      (this.hasRangedWeapon() ? this.hasArrows() : true) &&
      this.isInRange(this.getWeaponRange()) &&
      isObjectAhead(this, this.selectedPlayer) &&
      this.noObstacles({ finder, map, PF })
    );
  }

  canGetResource(energyCost) {
    if (!this.isInRange(1)) {
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
      this.selectedPlayerTile === null ||
      this.selectedPlayer.positionTile.tileX !==
        this.selectedPlayerTile.tileX ||
      this.selectedPlayer.positionTile.tileY !== this.selectedPlayerTile.tileY
    ) {
      this.selectedPlayerTile = {
        tileX: this.selectedPlayer.positionTile.tileX,
        tileY: this.selectedPlayer.positionTile.tileY,
      };

      let obj = this.selectedPlayer;

      if (this.selectedPlayer.positionTile === undefined) {
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
      this.energyRegenDelayTicks >= this.energyRegenDelayMaxTicks &&
      !this.isDead &&
      this.energy < ENERGY_MAX
    ) {
      this.energy += ENERGY_REGEN_RATE;
      this.energyRegenDelayTicks = 0;

      if (this.energy > ENERGY_MAX) {
        this.energy = ENERGY_MAX;
      }
      return true;
    }
    return false;
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
    this.energy = ENERGY_MAX;

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

export { ENERGY_MAX, HP_MAX, Player };
