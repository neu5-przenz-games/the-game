import { FRAME_IN_MS, TILE_HALF, TILE_QUARTER } from "../constants/index.mjs";

const getDurationFromMSToTicks = (ms) => Math.ceil(ms / FRAME_IN_MS);

const getDurationFromTicksToMS = (ticks) => Math.ceil(ticks * FRAME_IN_MS);

const MOCKS_TYPES = {
  MINI: "mini",
  PRODUCTION: "production",
  TEST: "test",
};

const getMocksType = (type = MOCKS_TYPES.PRODUCTION) =>
  ({
    mini: MOCKS_TYPES.MINI,
    production: MOCKS_TYPES.PRODUCTION,
    test: MOCKS_TYPES.TEST,
  }[type]);

const getObjectTiles = ({ positionTile, size = { x: 1, y: 1 } }) => {
  if (size.x <= 0 || size.y <= 0) {
    return [];
  }

  const { tileX, tileY } = positionTile;

  const objectTiles = [];

  for (let x = tileX; x < tileX + size.x; x += 1) {
    for (let y = tileY; y < tileY + size.y; y += 1) {
      objectTiles.push({ tileX: x, tileY: y });
    }
  }

  return objectTiles;
};

const getSurroundingTiles = ({
  positionTile,
  size = { x: 1, y: 1 },
  sizeToIncrease = { x: 1, y: 1 },
}) => {
  const { tileX, tileY } = positionTile;
  if (tileX < 1 || tileY < 1) {
    return [];
  }

  const objectTiles = getObjectTiles({ positionTile, size });

  if (objectTiles.length === 0) {
    return [];
  }

  const tiles = [];

  for (
    let x = tileX - sizeToIncrease.x;
    x < tileX + size.x + sizeToIncrease.x;
    x += 1
  ) {
    for (
      let y = tileY - sizeToIncrease.y;
      y < tileY + size.y + sizeToIncrease.y;
      y += 1
    ) {
      if (
        x > 0 &&
        y > 0 &&
        !objectTiles.some(
          (objectTile) => x === objectTile.tileX && y === objectTile.tileY
        )
      ) {
        tiles.push({ tileX: x, tileY: y });
      }
    }
  }

  return tiles;
};

const getXYFromTile = (tileX, tileY) => ({
  x: tileX * TILE_HALF - tileY * TILE_HALF,
  y: tileX * TILE_QUARTER + tileY * TILE_QUARTER,
});

export {
  MOCKS_TYPES,
  getDurationFromMSToTicks,
  getDurationFromTicksToMS,
  getMocksType,
  getObjectTiles,
  getSurroundingTiles,
  getXYFromTile,
};
