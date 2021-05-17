/**
 * Role of this script is to create two-dimensional array
 * containing colliding tiles - player shouldn't be able to stand on that tile.
 *
 * Tiled map editor generates one-dimensional array for every layer.
 * In this script we take that array and we create two-dimensional array
 * in the phaser-like manner so it can be used on server.
 */
const fs = require("fs");

const LAYER_NAME = "Collides";

const layerCollides = require("../public/assets/map/map.json").layers.find(
  (layer) => layer.name === LAYER_NAME
);

const buildings = require("../public/assets/map/buildings.js");

const buildingCollides = {
  x: [],
  y: [],
};

buildings.forEach((building) => {
  const {
    collides: { getStartingTile, size },
  } = building;

  const startingTile = getStartingTile(building.position);

  for (let sizeX = 0; sizeX < size.x; sizeX += 1) {
    buildingCollides.x.push(startingTile.x + sizeX);
  }
  for (let sizeY = 0; sizeY < size.y; sizeY += 1) {
    buildingCollides.y.push(startingTile.y + sizeY);
  }
});

const arr = [];

for (let y = 0, idx = 0; y < layerCollides.width; y += 1) {
  arr.push([]);
  for (let x = 0; x < layerCollides.height; x += 1) {
    const tileId = layerCollides.data[idx];
    arr[y][x] = tileId === 0 ? 0 : 1;

    if (buildingCollides.x.includes(x) && buildingCollides.y.includes(y)) {
      arr[y][x] = 1;
    }

    idx += 1;
  }
}

fs.writeFile(
  "./public/assets/map/map.js",
  `module.exports = ${JSON.stringify(arr)};`,
  (err) => {
    if (err) return console.log(err);

    return 1;
  }
);
