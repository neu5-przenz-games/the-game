const fs = require("fs");

const LAYER_NAME = "Collides";

const layerCollides = require("../public/assets/map/map.json").layers.find(
  (layer) => layer.name === LAYER_NAME
);

const arr = [];

for (let j = 0, m = 0; j < layerCollides.width; j += 1) {
  arr.push([]);
  for (let k = 0; k < layerCollides.height; k += 1) {
    const tileId = layerCollides.data[m];
    arr[j][k] = tileId === 0 ? -1 : tileId;
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
