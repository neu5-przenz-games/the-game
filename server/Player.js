const { getDestTile, getXYFromTile } = require("./utils/algo");

class Player {
  constructor({
    name,
    x,
    y,
    positionTile,
    dest,
    destTile,
    isFollowing,
    followedPlayer,
    followTile,
    next,
    nextTile,
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
    this.destTile = destTile;
    this.isFollowing = isFollowing;
    this.followedPlayer = followedPlayer;
    this.followTile = followTile;
    this.next = next;
    this.nextTile = nextTile;

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
    this.isFollowing = true;
    this.followedPlayer = playerToFollow;
    this.followTile = {
      tileX: playerToFollow.positionTile.tileX,
      tileY: playerToFollow.positionTile.tileY,
    };

    this.destTile = getDestTile(this, this.followedPlayer, map);
    this.dest = getXYFromTile(this.destTile.tileX, this.destTile.tileY);
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
    this.isFollowing = false;
    this.followedPlayer = null;
    this.followTile = null;
  }
}

module.exports = {
  Player,
};
