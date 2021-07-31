import { TILE_HALF, TILE_QUARTER } from "./constants.mjs";

const getChebyshevDistance = (currTile, destTile) => {
  const distX = Math.abs(currTile.tileX - destTile.tileX);
  const distY = Math.abs(currTile.tileY - destTile.tileY);

  return Math.max(distX, distY);
};

const getRandomInt = (min, max) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
};

// @TODO: Clean up getSurroundingTiles function and test it #238
const getSurroundingTiles = ({ map, obj, sizeToIncrease = 2 }) => {
  const { startingTile, size } = obj;
  const position = {
    x: startingTile.tileX - (sizeToIncrease - 1),
    y: startingTile.tileY - (sizeToIncrease - 1),
  };
  const increasedSize = {
    x: size.tileX + sizeToIncrease,
    y: size.tileY + sizeToIncrease,
  };

  const tiles = [];

  for (let sizeX = 0; sizeX < increasedSize.x; sizeX += 1) {
    for (let sizeY = 0; sizeY < increasedSize.y; sizeY += 1) {
      const y = position.y + sizeY;
      const x = position.x + sizeX;
      if (map[y][x] === 0) {
        tiles.push({ tileX: x, tileY: y });
      }
    }
  }

  return tiles;
};

const availableTiles = (surroundingTiles, players) => {
  const tiles = [...surroundingTiles];
  const currentPlayersPositions = [];

  players.forEach((player) => {
    currentPlayersPositions.push(player.positionTile);
  });

  return tiles.reduce((avTiles, tile) => {
    if (
      currentPlayersPositions.every(
        (pos) => pos.tileX !== tile.tileX || pos.tileY !== tile.tileY
      )
    ) {
      avTiles.push(tile);
    }

    return avTiles;
  }, []);
};

const getRespawnTile = ({ players, ...opts }) => {
  const respawnTiles = availableTiles(getSurroundingTiles(opts), players);

  return respawnTiles[getRandomInt(0, respawnTiles.length - 1)];
};

const getXYFromTile = (tileX, tileY) => ({
  x: tileX * TILE_HALF - tileY * TILE_HALF,
  y: tileX * TILE_QUARTER + tileY * TILE_QUARTER,
});

const getDestTile = (player, { players, ...opts }) => {
  const tiles = getSurroundingTiles(opts);
  const { positionTile } = player;

  // check if player is standing next to the destination
  if (
    tiles.some(
      ({ tileX, tileY }) =>
        tileX === positionTile.tileX && tileY === positionTile.tileY
    )
  ) {
    return {};
  }

  const destTile = availableTiles(tiles, players).reduce(
    (savedTile, tile) => {
      const distance = getChebyshevDistance(
        {
          tileX: positionTile.tileX,
          tileY: positionTile.tileY,
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

  return destTile.distance > 0 ? destTile : {};
};

export { getChebyshevDistance, getDestTile, getRespawnTile, getXYFromTile };
