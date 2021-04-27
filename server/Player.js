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
    fightingPlayer,
    followedPlayer,
    followTile,
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
    this.fightingPlayer = fightingPlayer;
    this.followedPlayer = followedPlayer;
    this.followTile = followTile;
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

  setFollowing(playerToFollow, map) {
    this.followedPlayer = playerToFollow;
    this.followTile = {
      tileX: playerToFollow.positionTile.tileX,
      tileY: playerToFollow.positionTile.tileY,
    };

    const destTile = getDestTile(this, this.followedPlayer, map);

    this.dest = {
      ...getXYFromTile(destTile.tileX, destTile.tileY),
      tile: destTile,
    };
  }

  setFighting(playerToFight) {
    this.fightingPlayer = playerToFight;
  }

  canAttack(fightingPlayer) {
    return (
      this.attackDelay >= this.attackMaxDelay &&
      this.fightingPlayer.isDead === false &&
      getManhattanDistance(this.positionTile, fightingPlayer.positionTile) <= 2
    );
  }

  gotHit(damage) {
    this.hp -= damage;

    if (this.hp < 0) {
      this.hp = 0;
    }

    if (this.hp === 0) {
      this.isDead = true;
      this.resetFollowing();
      this.resetFighting();
    }
  }

  respawn() {
    this.isDead = false;
    this.hp = 100;
  }

  updateFollowing(map) {
    if (
      this.followedPlayer.positionTile.tileX !== this.followTile.tileX ||
      this.followedPlayer.positionTile.tileY !== this.followTile.tileY
    ) {
      this.setFollowing(this.followedPlayer, map);
    }
  }

  resetFighting() {
    this.fightingPlayer = null;
  }

  resetFollowing() {
    this.followedPlayer = null;
    this.followTile = null;
  }
}

module.exports = {
  Player,
};
