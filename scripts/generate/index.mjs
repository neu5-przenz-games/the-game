import { readFileSync } from "fs";
import { gameObjects as testGameObjects } from "./test/gameObjects.mjs";
import { gameObjects as productionGameObjects } from "./production/gameObjects.mjs";
import { mobs as testMobs } from "./test/mobs.mjs";
import { mobs as productionMobs } from "./production/mobs.mjs";
import { players as testPlayers } from "./test/players.mjs";
import { players as productionPlayers } from "./production/players.mjs";

export const getGameObjects = (type) => {
  const gameObjects = readFileSync(`mocks/${type}/gameObjects.json`, "utf8");

  if (type === "test") {
    return testGameObjects(JSON.parse(gameObjects));
  }

  return productionGameObjects(JSON.parse(gameObjects));
};

export const getMobs = (type) => {
  const mobs = readFileSync(`mocks/${type}/mobs.json`, "utf8");

  if (type === "test") {
    return testMobs(JSON.parse(mobs));
  }

  return productionMobs(JSON.parse(mobs));
};

export const getPlayers = (type) => {
  const players = readFileSync(`mocks/${type}/players.json`, "utf8");

  if (type === "test") {
    return testPlayers(JSON.parse(players));
  }

  return productionPlayers(JSON.parse(players));
};
