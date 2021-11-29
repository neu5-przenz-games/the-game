/**
 * Role of this script is to create two-dimensional array
 * containing colliding tiles - player shouldn't be able to stand on that tile.
 *
 * Tiled map editor generates one-dimensional array for every layer.
 * In this script we take that array and we create two-dimensional array
 * in the phaser-like manner so it can be used on server.
 */
import { copyFile, readFileSync, writeFileSync } from "fs";

import { gameObjects } from "../generated/gameObjects.mjs"; // eslint-disable-line

const mapType = process.env.MAP === "test" ? "testmap" : "map";

console.log({ mapType });

const map = readFileSync(`tiledMap/${mapType}.json`, "utf8");

const LAYER_NAME = "Collides";

const layerCollides = JSON.parse(map).layers.find(
  (layer) => layer.name === LAYER_NAME
);

const arr = [];

for (let y = 0, idx = 0; y < layerCollides.width; y += 1) {
  arr.push([]);
  for (let x = 0; x < layerCollides.height; x += 1) {
    const tileId = layerCollides.data[idx];
    arr[y][x] = tileId === 0 ? 0 : 1;

    idx += 1;
  }
}

gameObjects.forEach((gameObject) => {
  const { positionTile, size } = gameObject;

  for (let sizeX = 0; sizeX < size.x; sizeX += 1) {
    for (let sizeY = 0; sizeY < size.y; sizeY += 1) {
      const y = positionTile.tileY + sizeY;
      const x = positionTile.tileX + sizeX;

      arr[y][x] = 1;
    }
  }
});

copyFile(`tiledMap/${mapType}.json`, "./public/assets/map/map.json", (err) => {
  if (err) return console.log(err);

  return 1;
});

writeFileSync(
  "./public/assets/map/map.mjs",
  `export default ${JSON.stringify(arr)};`,
  (err) => {
    if (err) return console.log(err);

    return 1;
  }
);
