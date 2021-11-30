import { existsSync, mkdirSync, writeFileSync } from "fs";
import { getGameObjects, getMobs, getPlayers } from "./generate/index.mjs";

const mocksType = {
  mini: "mini",
  test: "test",
  production: "production",
}[process.env.MAP || "production"];

const gameObjects = getGameObjects(mocksType);
const mobs = getMobs(mocksType);
const players = getPlayers(mocksType);

console.log({ mocksType });

if (!existsSync("./generated")) {
  mkdirSync("./generated");
}

writeFileSync(
  "./generated/gameObjects.mjs",
  `export const gameObjects = ${JSON.stringify(gameObjects)};`,
  (err) => {
    if (err) return console.log(err);

    return 1;
  }
);
writeFileSync(
  "./generated/mobs.mjs",
  `export const mobs = ${JSON.stringify(mobs)};`,
  (err) => {
    if (err) return console.log(err);

    return 1;
  }
);
writeFileSync(
  "./generated/players.mjs",
  `export const playersMocks = ${JSON.stringify(players)};`,
  (err) => {
    if (err) return console.log(err);

    return 1;
  }
);
