import {
  gameItems,
  getCurrentWeapon,
} from "../../../shared/init/gameItems/index.mjs";
import {
  LEVEL_TYPES,
  getSkillPoints,
  skillsSchema,
} from "../../../shared/skills/index.mjs";
import { MESSAGES_TYPES } from "../../../shared/UIMessages/index.mjs";
import { ITEM_TYPES } from "../../../shared/gameItems/index.mjs";
import {
  getChebyshevDistance,
  getDestTile,
  getRandomTile,
  getXYFromTile,
} from "../../utils/algo.mjs";
import { isObjectAhead } from "../../utils/directions.mjs";

const HP_MAX = 1000;

const mobDefaultBackpack = gameItems.get("bag");

const defaultEquipment = {
  armor: { id: "armor", quantity: 1 },
  pants: { id: "pants", quantity: 1 },
  boots: { id: "boots", quantity: 1 },
  backpack: { id: mobDefaultBackpack.id, quantity: 1 },
  shield: { id: "shield", quantity: 1 },
  weapon: { id: "dagger", quantity: 1 },
  helmet: { id: "hat", quantity: 1 },
};

const defaultBackpack = {
  slots: mobDefaultBackpack.slots,
  items: [{ id: "bow", quantity: 1 }],
};

const skillPoints = getSkillPoints(LEVEL_TYPES.BEGINNER);

const defaultSkills = Object.entries(skillsSchema).reduce(
  (skills, [key, skillDetails]) => ({
    ...skills,
    [key]: {
      ...skillDetails,
      points: skillPoints,
    },
  }),
  {}
);

const STATES = {
  ESCAPING: "ESCAPING",
  FIGHTING: "FIGHTING",
  WALKING_RANDOMLY: "WALKING_RANDOMLY",
  SHOULD_ESCAPE: "SHOULD_ESCAPE",
};

const DEFAULT_STATE = STATES.WALKING_RANDOMLY;

class Devil {
  constructor({
    name,
    displayName,
    positionTile,
    presenceAreaCenterTile,
    size,
    dest,
    isWalking,
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

    // generated
    const { x, y } = getXYFromTile(positionTile.tileX, positionTile.tileY);
    this.x = x;
    this.y = y;
    this.toRespawn = false;
    this.isParrying = false;
    this.state = DEFAULT_STATE;
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

  setSelectedObject(player) {
    this.selectedObject = player;
  }

  setSettingsFollow(value) {
    this.isWalking = false;
    this.settings.follow = value;
  }

  setSettingsFight(value) {
    this.settings.fight = value;
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

  setDefaultEquipment() {
    this.setBackpack(defaultBackpack.slots, defaultBackpack.items);
    this.setEquipment(defaultEquipment);
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

  getPlayerToAttack(players) {
    const playersInRange = [];

    players.forEach((player) => {
      const distance = getChebyshevDistance(
        this.positionTile,
        player.positionTile
      );

      if (
        this.name !== player.name &&
        player.constructor.TYPE === "Player" &&
        player.isDead === false &&
        distance < this.constructor.ATTACKING_DISTANCE
      ) {
        playersInRange.push({
          player,
          distance,
        });
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

  setState(STATE) {
    this.state = STATE;
  }

  getState(players, map) {
    if (this.isDead) {
      return;
    }

    if (this.state === STATES.SHOULD_ESCAPE) {
      this.selectedObject = null;
      this.selectedObjectTile = null;

      const goToTile = getRandomTile({
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
      const { tileX, tileY } = goToTile;
      this.dest = {
        ...getXYFromTile(tileX, tileY),
        tile: { tileX, tileY },
      };

      this.state = STATES.ESCAPING;
    }

    if (this.selectedObject?.isDead) {
      this.selectedObject = null;
      this.selectedObjectTile = null;
    }

    if (this.state === STATES.ESCAPING) {
      if (this.dest === null) {
        this.setState(DEFAULT_STATE);
      }

      return;
    }

    if (this.selectedObject === null) {
      const playerToAttack = this.getPlayerToAttack(players);
      if (playerToAttack) {
        this.setSelectedObject(playerToAttack);
        this.setState(STATES.FIGHTING);
      }

      if (this.dest === null) {
        if (
          this.getNextDestDelayTicks.value < this.getNextDestDelayTicks.maxValue
        ) {
          this.getNextDestDelayTicks.value += 1;
        } else {
          if (this.state !== this.WALKING_RANDOMLY) {
            this.setState(this.WALKING_RANDOMLY);
          }

          this.getNextDestDelayTicks.value = 0;
          const goToTile = getRandomTile({
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
          const { tileX, tileY } = goToTile;
          this.dest = {
            ...getXYFromTile(tileX, tileY),
            tile: { tileX, tileY },
          };
        }
      }
    }
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
        this.state !== STATES.SHOULD_ESCAPE &&
        this.state !== STATES.ESCAPING
      ) {
        this.setState(STATES.SHOULD_ESCAPE);
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

export { HP_MAX, Devil, defaultBackpack, defaultEquipment, defaultSkills };
