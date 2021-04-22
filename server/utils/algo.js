const { TILE_HALF, TILE_QUARTER } = require("./constants");

const getManhattanDistance = (currTile, destTile) =>
  Math.abs(currTile.tileX - destTile.tileX) +
  Math.abs(currTile.tileY - destTile.tileY);

const getNeightbours = (tileX, tileY) => [
  {
    tileX: tileX + 1,
    tileY,
  },
  {
    tileX: tileX + 1,
    tileY: tileY + 1,
  },
  {
    tileX,
    tileY: tileY + 1,
  },
  {
    tileX: tileX - 1,
    tileY: tileY + 1,
  },
  {
    tileX: tileX - 1,
    tileY,
  },
  {
    tileX: tileX - 1,
    tileY: tileY - 1,
  },
  {
    tileX,
    tileY: tileY - 1,
  },
  {
    tileX: tileX + 1,
    tileY: tileY - 1,
  },
];

const getXYFromTile = (tileX, tileY) => ({
  x: tileX * TILE_HALF - tileY * TILE_HALF,
  y: tileX * TILE_QUARTER + tileY * TILE_QUARTER,
});

const getDestTile = (player, playerToFollow, map) =>
  getNeightbours(playerToFollow.tileX, playerToFollow.tileY)
    // filter out non-walkable tiles
    .filter((tile) => map[tile.tileY][tile.tileX] === 0)
    // return tile with the smallest manhattan distance
    .reduce(
      (savedTile, tile) => {
        const distance = getManhattanDistance(
          { tileX: player.tileX, tileY: player.tileY },
          tile
        );

        return distance < savedTile.distance
          ? {
              ...tile,
              distance,
            }
          : savedTile;
      },
      { distance: Infinity }
    );

module.exports = {
  getDestTile,
  getManhattanDistance,
  getNeightbours,
  getXYFromTile,
};
