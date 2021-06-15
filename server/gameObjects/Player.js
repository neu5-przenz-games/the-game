const {
  getChebyshevDistance,
  getDestTile,
  getXYFromTile,
} = require("../utils/algo");

const noObstacles = ({ PF, finder, map, player }) => {
  let noObstacle = true;

  if (player.equipment.weapon === "bow") {
    const combatGrid = new PF.Grid(map.length, map.length);
    const combatPath = finder
      .findPath(
        player.positionTile.tileX,
        player.positionTile.tileY,
        player.selectedPlayer.positionTile.tileX,
        player.selectedPlayer.positionTile.tileY,
        combatGrid
      )
      .slice(1, -1);

    noObstacle = combatPath.every(([x, y]) => map[y][x] === 0);
  }

  return noObstacle;
};

const ENERGY_ACTION_USE = 50;

const ENERGY_ATTACK_USE = 15;
const ENERGY_REGEN_RATE = 3;
const ENERGY_MAX = 100;

class Player {
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
    settings,
    selectedPlayer,
    selectedPlayerTile,
    dropSelection,
    action,
    actionDurationTicks,
    actionDurationMaxTicks,
    attack,
    attackDelayTicks,
    attackDelayMaxTicks,
    energyRegenDelayTicks,
    energyRegenDelayMaxTicks,
    next,
    speed,
    isOnline,
    socketId,
    direction,
    hp,
    energy,
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
    this.settings = settings;
    this.selectedPlayer = selectedPlayer;
    this.selectedPlayerTile = selectedPlayerTile;

    // properties
    this.action = action;
    this.actionDurationTicks = actionDurationTicks;
    this.actionDurationMaxTicks = actionDurationMaxTicks;
    this.attack = attack;
    this.attackDelayTicks = attackDelayTicks;
    this.attackDelayMaxTicks = attackDelayMaxTicks;
    this.energyRegenDelayTicks = energyRegenDelayTicks;
    this.energyRegenDelayMaxTicks = energyRegenDelayMaxTicks;
    this.hp = hp;
    this.energy = energy;

    // technical info
    this.socketId = socketId;
    this.isOnline = isOnline;

    // generated
    const { x, y } = getXYFromTile(positionTile.tileX, positionTile.tileY);
    this.x = x;
    this.y = y;
    this.toRespawn = false;
  }

  addToBackpack(newItem) {
    const item = this.backpack.items.find((i) => i.name === newItem);

    if (item) {
      item.quantity += 1;
    } else {
      if (this.backpack.slots === this.backpack.items.length) {
        return false;
      }

      this.backpack.items.push({
        name: newItem,
        quantity: 1,
      });
    }

    return true;
  }

  setOnline(socketId) {
    this.isOnline = true;
    this.socketId = socketId;
  }

  setSelectedObject(player) {
    this.selectedPlayer = player;
  }

  setSettingsFollow(value) {
    this.settings.follow = value;
  }

  setSettingsFight(value) {
    this.settings.fight = value;
  }

  setSettingsShowRange(value) {
    this.settings.showRange = value;
  }

  setWeapon(value) {
    this.equipment.weapon = value;
  }

  inRange(range) {
    return (
      getChebyshevDistance(
        this.positionTile,
        this.selectedPlayer.positionTile
      ) <= range
    );
  }

  canAttack({ PF, finder, map }) {
    return (
      this.attackDelayTicks >= this.attackDelayMaxTicks &&
      this.selectedPlayer.isDead === false &&
      this.inRange(this.equipment.weapon === "sword" ? 1 : 5) &&
      this.energy >= ENERGY_ATTACK_USE &&
      noObstacles({ PF, finder, map, player: this })
    );
  }

  canPerformAction() {
    return this.inRange(1) && this.energy >= ENERGY_ACTION_USE;
  }

  gotHit(damage) {
    this.hp -= damage;

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

      if (this.selectedPlayer.startingTile === undefined) {
        obj = {
          ...obj,
          startingTile: obj.positionTile,
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

  energyUse(type) {
    this.energy -= {
      attack: ENERGY_ATTACK_USE,
      chop: ENERGY_ACTION_USE,
      mine: ENERGY_ACTION_USE,
    }[type];
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

  respawn(respawnTile) {
    this.isDead = false;
    this.toRespawn = false;
    this.hp = 100;
    this.energy = ENERGY_MAX;

    const respawnXY = getXYFromTile(respawnTile.tileX, respawnTile.tileY);
    this.positionTile = respawnTile;
    this.x = respawnXY.x;
    this.y = respawnXY.y;
  }

  resetSelected() {
    this.dropSelection = true;
  }
}

module.exports = {
  Player,
};
