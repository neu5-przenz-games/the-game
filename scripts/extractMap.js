/**
 * Role of this script is to create two-dimensional array
 * containing colliding tiles - player shouldn't be able to stand on that tile.
 *
 * Tiled map editor generates one-dimensional array for every layer.
 * In this script we take that array and we create two-dimensional array
 * in the phaser-like manner so it can be used on backend.
 */
const fs = require("fs");

const LAYER_NAME = "Collides";

const layerCollides = require("../public/assets/map/map.json").layers.find(
  (layer) => layer.name === LAYER_NAME
);

const arr = [];

for (let i = 0, idx = 0; i < layerCollides.width; i += 1) {
  arr.push([]);
  for (let j = 0; j < layerCollides.height; j += 1) {
    const tileId = layerCollides.data[idx];
    arr[i][j] = tileId === 0 ? 0 : 1;
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
