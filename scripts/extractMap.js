const fs = require("fs");

const LAYER_NAME = "Collides";

const layerCollides = require("../public/assets/map/map.json").layers.find(
  (layer) => layer.name === LAYER_NAME
);

const arr = [];

for (let i = 0; i < layerCollides.width; i += 1) {
  arr.push([]);
}

for (let j = 0, m = 0; j < layerCollides.width; j += 1) {
  for (let k = 0; k < layerCollides.height; k += 1) {
    const tile = layerCollides.data[m];
    arr[j][k] = tile === 0 ? -1 : tile;
    m += 1;
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
