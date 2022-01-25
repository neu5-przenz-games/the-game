import { existsSync, mkdirSync, writeFile } from "fs";
import {
  getConfig,
  getGameObjects,
  getMobs,
  getPlayers,
} from "./generate/index.mjs";
import { getMocksType } from "../packages/shared/utils/index.mjs";

const mocksType = getMocksType(process.env.MAP);

const gameObjects = getGameObjects(mocksType);
const mobs = getMobs(mocksType);
const players = getPlayers(mocksType);

console.log({ mocksType });

if (!existsSync("./generated")) {
  mkdirSync("./generated");
}

const config = getConfig(mocksType);

writeFile(
  "./generated/config.mjs",
  `export const config = ${JSON.stringify(config)};`,
  (err) => {
    if (err) return console.log(err);

    return 1;
  }
);

writeFile(
  "./generated/gameObjects.mjs",
  `export const gameObjects = ${JSON.stringify(gameObjects)};`,
  (err) => {
    if (err) return console.log(err);

    return 1;
  }
);
writeFile(
  "./generated/mobs.mjs",
  `export const mobs = ${JSON.stringify(mobs)};`,
  (err) => {
    if (err) return console.log(err);

    return 1;
  }
);
writeFile(
  "./generated/players.mjs",
  `export const playersMocks = ${JSON.stringify(players)};`,
  (err) => {
    if (err) return console.log(err);

    return 1;
  }
);
