export const getObjectTiles = ({ tileX, tileY, sizeX = 1, sizeY = 1 }) => {
  if (sizeX <= 0 || sizeY <= 0) {
    return [];
  }

  const objectTiles = [];

  for (let x = tileX; x < tileX + sizeX; x += 1) {
    for (let y = tileY; y < tileY + sizeY; y += 1) {
      objectTiles.push({ tileX: x, tileY: y });
    }
  }

  return objectTiles;
};

export const getSurroundingTiles = ({
  tileX,
  tileY,
  sizeX = 1,
  sizeY = 1,
  sizeToIncreaseX = 1,
  sizeToIncreaseY = 1,
}) => {
  if (tileX < 1 || tileY < 1) {
    return [];
  }

  const objectTiles = getObjectTiles({ tileX, tileY, sizeX, sizeY });

  if (objectTiles.length === 0) {
    return [];
  }

  const tiles = [];

  for (
    let x = tileX - sizeToIncreaseX;
    x < tileX + sizeX + sizeToIncreaseX;
    x += 1
  ) {
    for (
      let y = tileY - sizeToIncreaseY;
      y < tileY + sizeY + sizeToIncreaseY;
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
