import express from "express";

import { createServer } from "http";

import { playersMocks } from "./mocks/players.mjs";
import { Player } from "./gameObjects/Player.mjs";

import { sockets } from "./sockets/index.mjs";
import { loop } from "./loop/index.mjs";

const app = express();
const httpServer = createServer(app);

const FRAME_IN_MS = 1000 / 30;

const players = new Map();

playersMocks.forEach((player) => {
  players.set(player.name, new Player(player));
});

const io = sockets({ players, httpServer, FRAME_IN_MS });

setInterval(() => {
  loop(players, io);
}, FRAME_IN_MS);

app.use(express.static("dist"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./dist" });
});

export const server = httpServer.listen(process.env.PORT || 5000);
