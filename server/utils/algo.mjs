import { TILE_HALF, TILE_QUARTER } from "./constants.mjs";
import { getSurroundingTiles } from "../../shared/utils.mjs";

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

const availableTiles = ({ surroundingTiles, players, map }) => {
  const tiles = [...surroundingTiles];
  const currentPlayersPositions = [];

  players.forEach((player) => {
    currentPlayersPositions.push(player.positionTile);
  });

  return tiles.reduce((avTiles, tile) => {
    if (
      map[tile.tileY][tile.tileX] === 0 &&
      currentPlayersPositions.every(
        (pos) => pos.tileX !== tile.tileX || pos.tileY !== tile.tileY
      )
    ) {
      avTiles.push(tile);
    }

    return avTiles;
  }, []);
};

const getRespawnTile = ({ map, obj, players, sizeToIncrease }) => {
  const { startingTile, size } = obj;

  const respawnTiles = availableTiles({
    surroundingTiles: getSurroundingTiles({
      startingTile,
      size,
      sizeToIncrease,
    }),
    players,
    map,
  });

  return respawnTiles[getRandomInt(0, respawnTiles.length - 1)];
};

const getXYFromTile = (tileX, tileY) => ({
  x: tileX * TILE_HALF - tileY * TILE_HALF,
  y: tileX * TILE_QUARTER + tileY * TILE_QUARTER,
});

const getDestTile = (player, { map, obj, players }) => {
  const { size } = obj;
  const surroundingTiles = getSurroundingTiles({
    startingTile: obj.positionTile,
    size,
  });
  const { positionTile } = player;

  // check if player is at the destination
  if (
    surroundingTiles.some(
      ({ tileX, tileY }) =>
        tileX === positionTile.tileX && tileY === positionTile.tileY
    )
  ) {
    return {};
  }

  const destTile = availableTiles({ surroundingTiles, players, map }).reduce(
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
