const {
  getDestTile,
  getXYFromTile,
  getManhattanDistance,
} = require("./utils/algo");

class Player {
  constructor({
    name,
    x,
    y,
    positionTile,
    dest,
    isWalking,
    isDead,
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
    this.x = x;
    this.y = y;
    this.positionTile = positionTile;
    this.dest = dest;
    this.isWalking = isWalking;
    this.isDead = isDead;
    this.settings = settings;
    this.selectedPlayer = selectedPlayer;
    this.selectedPlayerTile = selectedPlayerTile;

    this.attack = attack;
    this.attackDelay = attackDelay;
    this.attackMaxDelay = attackMaxDelay;
    this.next = next;

    this.direction = direction;
    this.speed = speed;

    // game properties
    this.hp = hp;

    this.socketId = socketId;
    this.isOnline = isOnline;
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

  canAttack() {
    return (
      this.attackDelay >= this.attackMaxDelay &&
      this.selectedPlayer.isDead === false &&
      getManhattanDistance(
        this.positionTile,
        this.selectedPlayer.positionTile
      ) <= 2
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

  respawn() {
    this.isDead = false;
    this.hp = 100;
  }

  resetSelected() {
    this.selectedPlayer = null;
    this.selectedPlayerTile = null;
  }
}

module.exports = {
  Player,
};
