const { getDestTile, getXYFromTile } = require("./utils/algo");

class Player {
  constructor({
    name,
    x,
    y,
    positionTile,
    dest,
    followedPlayer,
    followTile,
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
    this.followedPlayer = followedPlayer;
    this.followTile = followTile;
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

  updateFollowing(map) {
    if (
      this.followedPlayer.positionTile.tileX !== this.followTile.tileX ||
      this.followedPlayer.positionTile.tileY !== this.followTile.tileY
    ) {
      this.setFollowing(this.followedPlayer, map);
    }
  }

  resetFollowing() {
    this.followedPlayer = null;
    this.followTile = null;
  }
}

module.exports = {
  Player,
};
