import express from "express";

import { createServer } from "http";

import { Player } from "./gameObjects/creatures/Player.mjs";
import { createMob } from "./gameObjects/creatures/index.mjs";
import { sockets } from "./sockets/index.mjs";
import { loop } from "./loop/index.mjs";
import { wikiPages } from "./pages/wiki.mjs";
import { FRAME_IN_MS } from "../shared/constants/index.mjs";
import { gameObjects } from "../generated/gameObjects.mjs";
import { mobs } from "../generated/mobs.mjs";
import { playersMocks } from "../generated/players.mjs";

const app = express();
const httpServer = createServer(app);

const players = new Map();

const healingStones = gameObjects.filter(
  (gameObject) => gameObject.type === "HealingStone"
);

playersMocks.forEach((player) => {
  players.set(player.name, new Player(player));
});

mobs.forEach((mob) => {
  players.set(mob.name, createMob(mob));
});

const io = sockets({
  gameObjects,
  httpServer,
  players,
});

setInterval(() => {
  loop({ gameObjects, healingStones, io, players });
}, FRAME_IN_MS);

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "../client/dist" });
});

wikiPages(app);

export const server = httpServer.listen(process.env.PORT || 5000);
