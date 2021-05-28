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

const getRandomInt = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
};

const getRespawnTile = (map, building, players, sizeToIncrease = 3) => {
  const { startingTile, size } = building;
  const position = {
    x: startingTile.x - (sizeToIncrease - 1),
    y: startingTile.y - (sizeToIncrease - 1),
  };
  const increasedSize = {
    x: size.x + sizeToIncrease,
    y: size.y + sizeToIncrease,
  };

  const respawnRange = [];
  const currentPlayersPositions = [];

  players.forEach((player) => {
    currentPlayersPositions.push(player.positionTile);
  });

  for (let sizeX = 0; sizeX < increasedSize.x; sizeX += 1) {
    for (let sizeY = 0; sizeY < increasedSize.y; sizeY += 1) {
      const y = position.y + sizeY;
      const x = position.x + sizeX;
      if (
        map[y][x] === 0 &&
        currentPlayersPositions.every(
          (pos) => pos.tileX !== x || pos.tileY !== y
        )
      ) {
        respawnRange.push({ x, y });
      }
    }
  }

  return respawnRange[getRandomInt(0, respawnRange.length - 1)];
};

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
  getRespawnTile,
  getXYFromTile,
};
