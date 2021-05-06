const { TILE_HALF, TILE_QUARTER } = require("./constants");

const getChebyshevDistance = (currTile, destTile) => {
  const distX = Math.abs(currTile.tileX - destTile.tileX);
  const distY = Math.abs(currTile.tileY - destTile.tileY);

  return Math.max(distX, distY);
};

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
  getNeightbours(
    playerToFollow.positionTile.tileX,
    playerToFollow.positionTile.tileY
  )
    // filter out non-walkable tiles
    .filter((tile) => map[tile.tileY][tile.tileX] === 0)
    // return tile with the smallest manhattan distance
    .reduce(
      (savedTile, tile) => {
        const distance = getChebyshevDistance(
          {
            tileX: player.positionTile.tileX,
            tileY: player.positionTile.tileY,
          },
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
  getChebyshevDistance,
  getDestTile,
  getNeightbours,
  getXYFromTile,
};
