export const getObjectTiles = ({ startingTile, size = { x: 1, y: 1 } }) => {
  if (size.x <= 0 || size.y <= 0) {
    return [];
  }

  const { tileX, tileY } = startingTile;

  const objectTiles = [];

  for (let x = tileX; x < tileX + size.x; x += 1) {
    for (let y = tileY; y < tileY + size.y; y += 1) {
      objectTiles.push({ tileX: x, tileY: y });
    }
  }

  return objectTiles;
};

export const getSurroundingTiles = ({
  startingTile,
  size = { x: 1, y: 1 },
  sizeToIncrease = { x: 1, y: 1 },
}) => {
  const { tileX, tileY } = startingTile;
  if (tileX < 1 || tileY < 1) {
    return [];
  }

  const objectTiles = getObjectTiles({ startingTile, size });

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
