const {
  getChebyshevDistance,
  getDestTile,
  getXYFromTile,
} = require("./utils/algo");

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

class Player {
  constructor({
    name,
    positionTile,
    dest,
    isWalking,
    isDead,
    equipment,
    settings,
    selectedPlayer,
    selectedPlayerTile,
    attack,
    attackDelay,
    attackMaxDelay,
    next,
    speed,
    isOnline,
    socketId,
    direction,
    hp,
  }) {
    this.name = name;

    // movement
    this.positionTile = positionTile;
    this.dest = dest;
    this.isWalking = isWalking;
    this.isDead = isDead;
    this.direction = direction;
    this.speed = speed;
    this.next = next;

    // settings
    this.equipment = equipment;
    this.settings = settings;
    this.selectedPlayer = selectedPlayer;
    this.selectedPlayerTile = selectedPlayerTile;

    // properties
    this.attack = attack;
    this.attackDelay = attackDelay;
    this.attackMaxDelay = attackMaxDelay;
    this.hp = hp;

    // technical info
    this.socketId = socketId;
    this.isOnline = isOnline;

    // generated
    const { x, y } = getXYFromTile(positionTile.tileX, positionTile.tileY);
    this.x = x;
    this.y = y;
    this.toRespawn = false;
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

  inRange() {
    const range = this.equipment.weapon === "sword" ? 1 : 5;

    return (
      getChebyshevDistance(
        this.positionTile,
        this.selectedPlayer.positionTile
      ) <= range
    );
  }

  canAttack({ PF, finder, map }) {
    return (
      noObstacles({ PF, finder, map, player: this }) &&
      this.attackDelay >= this.attackMaxDelay &&
      this.selectedPlayer.isDead === false &&
      this.inRange()
    );
  }

  gotHit(damage) {
    this.hp -= damage;

    if (this.hp < 0) {
      this.hp = 0;
    }

    if (this.hp === 0) {
      this.isDead = true;
      this.resetSelected();
    }
  }

  updateFollowing(map) {
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

      const destTile = getDestTile(this, this.selectedPlayer, map);

      this.dest = {
        ...getXYFromTile(destTile.tileX, destTile.tileY),
        tile: destTile,
      };
    }
  }

  respawn(respawnTile) {
    this.isDead = false;
    this.toRespawn = false;
    this.hp = 100;

    const respawnXY = getXYFromTile(respawnTile.x, respawnTile.y);
    this.positionTile = { tileX: respawnTile.x, tileY: respawnTile.y };
    this.x = respawnXY.x;
    this.y = respawnXY.y;
  }

  resetSelected() {
    this.selectedPlayer = null;
    this.selectedPlayerTile = null;
  }
}

module.exports = {
  Player,
};
