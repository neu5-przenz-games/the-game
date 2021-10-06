import express from "express";

import { createServer } from "http";

import { playersMocks } from "./mocks/players.mjs";
import { Player } from "./gameObjects/Player.mjs";
import { sockets } from "./sockets/index.mjs";
import { loop } from "./loop/index.mjs";
import { gameObjects } from "../shared/init/gameObjects.mjs";
import { LootingBag } from "../shared/gameObjects/index.mjs";

const app = express();
const httpServer = createServer(app);

const FRAME_IN_MS = 1000 / 30;

const players = new Map();

const healingStones = gameObjects.reduce((res, go) => {
  if (go.type === "HealingStone") {
    res.push(go);
  }

  return res;
}, []);

const lootingBag = new LootingBag({
  name: `LootingBag10x16`,
  positionTile: { tileX: 10, tileY: 16 },
  items: [
    { id: "armor", quantity: 1 },
    { id: "sword", quantity: 1 },
  ],
});

playersMocks.forEach((player) => {
  players.set(player.name, new Player(player));
});

const go = [...gameObjects, lootingBag];

const io = sockets({
  gameObjects: go,
  httpServer,
  players,
  FRAME_IN_MS,
});

setInterval(() => {
  loop({ gameObjects: go, healingStones, io, players });
}, FRAME_IN_MS);

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./dist" });
});

export const server = httpServer.listen(process.env.PORT || 5000);
