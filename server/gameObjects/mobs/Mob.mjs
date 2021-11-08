import {
  getChebyshevDistance,
  getDestTile,
  getPatrollingIndex,
  getRandomTile,
  getXYFromTile,
  noObstacles,
} from "../../utils/algo.mjs";
import { isObjectAhead } from "../../utils/directions.mjs";
import { Player } from "../Player.mjs";
import {
  gameItems,
  getCurrentWeapon,
} from "../../../shared/init/gameItems/index.mjs";
import { MESSAGES_TYPES } from "../../../shared/UIMessages/index.mjs";
import { ITEM_TYPES } from "../../../shared/gameItems/index.mjs";

import { HP_MAX, PLAYER_STATES } from "../constants.mjs";

class Mob {
  constructor({
    name,
    displayName,
    positionTile,
    presenceAreaCenterTile,
    size,
    defaultState = PLAYER_STATES.WALKING_RANDOMLY,
    patrollingTiles = [],
    dest,
    isWalking,
    buffs,
    isDead,
    equipment,
    backpack,
    settings,
    selectedObject,
    selectedObjectTile,
    dropSelection,
    attack,
    attackDelayTicks,
    respawnDelayTicks,
    getNextDestDelayTicks,
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
    this.presenceAreaCenterTile = presenceAreaCenterTile;
    this.size = size;
    this.dest = dest;
    this.isWalking = isWalking;
    this.buffs = buffs;
    this.isDead = isDead;
    this.direction = direction;
    this.speed = speed;
    this.next = next;
    this.dropSelection = dropSelection;

    // settings
    this.equipment = equipment;
    this.backpack = backpack;
    this.settings = settings;
    this.selectedObject = selectedObject;
    this.selectedObjectTile = selectedObjectTile;

    // properties
    this.attack = attack;
    this.attackDelayTicks = attackDelayTicks;
    this.respawnDelayTicks = respawnDelayTicks;
    this.getNextDestDelayTicks = getNextDestDelayTicks;
    this.hp = hp;
    this.skills = skills;
    this.defaultState = defaultState;
    this.patrollingTiles = patrollingTiles;

    // generated
    const { x, y } = getXYFromTile(positionTile.tileX, positionTile.tileY);
    this.x = x;
    this.y = y;
    this.toRespawn = false;
    this.isParrying = false;
    this.patrollingIndex = 0;
    this.state = this.defaultState;
  }

  static DISPLAY_NAME = "Devil";

  static TYPE = "Devil";

  static ATTACKING_DISTANCE = 8;

  static ESCAPE_DISTANCE = 10;

  getFromBackpack(itemName) {
    return this.backpack.items.find((item) => item.id === itemName);
  }

  getWeaponRange() {
    return getCurrentWeapon(this.equipment.weapon).details.range;
  }

  getPlayerToAttack(players) {
    const playersInRange = [];

    players.forEach((player) => {
      if (
        this.name !== player.name &&
        player.constructor.TYPE === Player.TYPE &&
        player.isDead === false
      ) {
        const distance = getChebyshevDistance(
          this.positionTile,
          player.positionTile
        );

        if (distance < this.constructor.ATTACKING_DISTANCE) {
          playersInRange.push({
            player,
            distance,
          });
        }
      }
    });

    if (playersInRange.length === 0) {
      return null;
    }

    if (playersInRange.length === 1) {
      return playersInRange[0].player;
    }

    return playersInRange.reduce(
      (closestPlayer, player) => {
        return player.distance < closestPlayer.distance
          ? player
          : closestPlayer;
      },
      { distance: Infinity }
    ).player;
  }

  getMobRandomTile(map, players) {
    return getRandomTile({
      map,
      obj: {
        positionTile: this.presenceAreaCenterTile,
        size: this.size,
      },
      players,
      sizeToIncrease: {
        x: 2,
        y: 2,
      },
    });
  }

  getNextDestination(map, players) {
    const { tileX, tileY } = {
      [PLAYER_STATES.PATROLLING]: () => {
        this.patrollingIndex = getPatrollingIndex(
          this.patrollingIndex,
          this.patrollingTiles.length - 1
        );

        return this.patrollingTiles[this.patrollingIndex];
      },
      [PLAYER_STATES.WALKING_RANDOMLY]: () =>
        this.getMobRandomTile(map, players),
    }[this.defaultState]();

    this.dest = {
      ...getXYFromTile(tileX, tileY),
      tile: { tileX, tileY },
    };
  }

  getState(players, map) {
    if (this.isDead) {
      this.setState(this.defaultState);
      return;
    }

    if (this.state === PLAYER_STATES.SHOULD_ESCAPE) {
      this.selectedObject = null;
      this.selectedObjectTile = null;

      this.getNextDestination(map, players);

      this.state = PLAYER_STATES.ESCAPING;
    }

    if (this.state === PLAYER_STATES.ESCAPING) {
      if (this.dest === null) {
        this.setState(this.defaultState);
      }

      return;
    }

    if (this.selectedObject === null) {
      if (this.state === PLAYER_STATES.FIGHTING) {
        this.setState(this.defaultState);
      }

      const playerToAttack = this.getPlayerToAttack(players);

      if (playerToAttack) {
        this.setSelectedObject(playerToAttack);
        this.setState(PLAYER_STATES.FIGHTING);
      }
    } else if (this.selectedObject.isDead) {
      this.selectedObject = null;
      this.selectedObjectTile = null;

      this.setState(this.defaultState);
    }

    if (this.state === this.defaultState && this.dest === null) {
      if (
        this.getNextDestDelayTicks.value < this.getNextDestDelayTicks.maxValue
      ) {
        this.getNextDestDelayTicks.value += 1;
      } else {
        this.getNextDestDelayTicks.value = 0;
        this.getNextDestination(map, players);
      }
    }
  }

  setSelectedObject(player) {
    this.selectedObject = player;
  }

  setSettingsFollow(value) {
    this.settings.follow = value;
  }

  setSettingsFight(value) {
    this.settings.fight = value;
  }

  setSettingsKeepSelectionOnMovement(value) {
    this.settings.keepSelectionOnMovement = value;
  }

  setState(STATE) {
    this.state = STATE;
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
      this.isDead === false &&
      this.selectedObject.isDead === false &&
      this.attackDelayTicks.value >= this.attackDelayTicks.maxValue &&
      (this.hasRangedWeapon() ? this.hasArrows() : true) &&
      this.isInRange(this.getWeaponRange()) &&
      isObjectAhead(this, this.selectedObject) &&
      noObstacles({
        finder,
        map,
        PF,
        positionTile: this.positionTile,
        selectedObjectPositionTile: this.selectedObject.positionTile,
        hasRangedWeapon: this.hasRangedWeapon(),
      })
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
      this.isDead = true;
      this.resetSelected();
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

      if (
        getChebyshevDistance(this.positionTile, this.presenceAreaCenterTile) >
          this.constructor.ESCAPE_DISTANCE &&
        this.state === PLAYER_STATES.FIGHTING
      ) {
        this.setState(PLAYER_STATES.SHOULD_ESCAPE);
      }

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
    this.respawnDelayTicks.value = 0;
    this.x = respawnXY.x;
    this.y = respawnXY.y;
  }

  resetSelected() {
    this.dropSelection = true;
  }
}

export { HP_MAX, Mob };
